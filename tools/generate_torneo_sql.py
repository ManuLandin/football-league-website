#!/usr/bin/env python3
"""Genera SQL idempotente para importar el formato de Torneo Apertura."""

from __future__ import annotations

import argparse
import re
import unicodedata
from collections import OrderedDict, defaultdict
from pathlib import Path

import openpyxl


MATCH_BLOCKS = (
    ("C", "D", "E", "F", "G"),
    ("I", "J", "K", "L", "M"),
    ("O", "P", "Q", "R", "S"),
    ("U", "V", "W", "X", "Y"),
)


def text(value) -> str:
    return "" if value is None else str(value).strip()


def sql(value: str) -> str:
    return "'" + value.replace("\\", "\\\\").replace("'", "''") + "'"


def team_key(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    normalized = "".join(ch for ch in normalized if not unicodedata.combining(ch))
    normalized = re.sub(r"[^A-Z0-9]+", " ", normalized.upper()).strip()
    normalized = re.sub(r"\bSTA\b", "SANTA", normalized)
    normalized = re.sub(r"\bANGLES\b", "ANGELES", normalized)
    normalized = re.sub(r"\s+I$", "", normalized)
    return re.sub(r"\s+", " ", normalized)


def category_name(sheet_name: str) -> str:
    return sheet_name.strip()


def jornada_number(value) -> int | None:
    match = re.search(r"JORA?NDA\s*(\d+)", text(value).upper())
    return int(match.group(1)) if match else None


def numeric_score(value) -> int | None:
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)) and float(value).is_integer() and value >= 0:
        return int(value)
    value_text = text(value)
    return int(value_text) if value_text.isdigit() else None


def choose_name(current: str | None, candidate: str) -> str:
    candidate = re.sub(r"\s+", " ", candidate.strip())
    if not current:
        return candidate
    # Prefiere nombres completos sobre abreviaturas y conserva el primero en empate.
    current_score = (len(current.replace("STA ", "SANTA ")), len(current))
    candidate_score = (len(candidate.replace("STA ", "SANTA ")), len(candidate))
    return candidate if candidate_score > current_score else current


def clean_team_name(value: str) -> str:
    value = re.sub(r"\s+", " ", value.strip())
    value = re.sub(r"\s+i$", "", value, flags=re.IGNORECASE)
    value = re.sub(r"\bSTA\b", "SANTA", value, flags=re.IGNORECASE)
    return value


def parse_workbook(path: Path):
    workbook = openpyxl.load_workbook(path, data_only=True, read_only=False)
    teams: OrderedDict[str, str] = OrderedDict()
    category_teams: dict[str, set[str]] = defaultdict(set)
    matches: list[dict] = []
    standings: list[dict] = []

    def register_team(raw_name: str) -> str:
        raw_name = clean_team_name(raw_name)
        key = team_key(raw_name)
        if not key:
            raise ValueError("Nombre de equipo vacío")
        teams[key] = choose_name(teams.get(key), raw_name)
        return key

    # Primera pasada: catálogos y nombres canónicos.
    for sheet in workbook.worksheets:
        category = category_name(sheet.title)
        for row in range(1, sheet.max_row + 1):
            if isinstance(sheet[f"A{row}"].value, (int, float)) and text(sheet[f"B{row}"].value):
                category_teams[category].add(register_team(text(sheet[f"B{row}"].value)))
            if isinstance(sheet[f"AB{row}"].value, (int, float)) and text(sheet[f"AC{row}"].value):
                category_teams[category].add(register_team(text(sheet[f"AC{row}"].value)))

        for row in range(1, sheet.max_row + 1):
            for _, local_col, vs_col, visit_col, _ in MATCH_BLOCKS:
                if text(sheet[f"{vs_col}{row}"].value).upper() != "VS":
                    continue
                local = text(sheet[f"{local_col}{row}"].value)
                visit = text(sheet[f"{visit_col}{row}"].value)
                if local and visit:
                    category_teams[category].add(register_team(local))
                    category_teams[category].add(register_team(visit))

    # Segunda pasada: partidos y posiciones.
    for sheet in workbook.worksheets:
        category = category_name(sheet.title)
        active_jornada = {block[0]: None for block in MATCH_BLOCKS}
        match_order = defaultdict(int)

        for row in range(1, sheet.max_row + 1):
            for score_l_col, local_col, vs_col, visit_col, score_v_col in MATCH_BLOCKS:
                header = jornada_number(sheet[f"{score_l_col}{row}"].value)
                if header is not None:
                    active_jornada[score_l_col] = header

                if text(sheet[f"{vs_col}{row}"].value).upper() != "VS":
                    continue
                jornada = active_jornada[score_l_col]
                local_raw = text(sheet[f"{local_col}{row}"].value)
                visit_raw = text(sheet[f"{visit_col}{row}"].value)
                if jornada is None or not local_raw or not visit_raw:
                    continue

                local_key = team_key(local_raw)
                visit_key = team_key(visit_raw)
                if local_key == visit_key:
                    continue

                score_l_raw = sheet[f"{score_l_col}{row}"].value
                score_v_raw = sheet[f"{score_v_col}{row}"].value
                score_l = numeric_score(score_l_raw)
                score_v = numeric_score(score_v_raw)
                played = score_l is not None and score_v is not None
                source_state = "/".join(filter(None, [text(score_l_raw), text(score_v_raw)]))
                order_key = (category, jornada)
                match_order[order_key] += 1
                matches.append(
                    {
                        "category": category,
                        "jornada": jornada,
                        "local": local_key,
                        "visit": visit_key,
                        "score_l": score_l,
                        "score_v": score_v,
                        "played": played,
                        "source_state": source_state if not played else "",
                        "order": match_order[order_key],
                    }
                )

            if not isinstance(sheet[f"AB{row}"].value, (int, float)):
                continue
            team_raw = text(sheet[f"AC{row}"].value)
            metrics = [sheet[f"{col}{row}"].value for col in ("AD", "AE", "AF", "AG", "AH", "AI", "AK")]
            if not team_raw or not all(isinstance(value, (int, float)) for value in metrics):
                continue
            standings.append(
                {
                    "category": category,
                    "team": team_key(team_raw),
                    "pj": int(metrics[0]),
                    "g": int(metrics[1]),
                    "e": int(metrics[2]),
                    "p": int(metrics[3]),
                    "gf": int(metrics[4]),
                    "gc": int(metrics[5]),
                    "points": int(metrics[6]),
                }
            )

    # Elimina duplicados exactos; el Excel contiene bloques repetidos/reprogramados.
    unique_matches = OrderedDict()
    for match in matches:
        key = (match["category"], match["jornada"], match["local"], match["visit"])
        existing = unique_matches.get(key)
        if existing is None or (match["played"] and not existing["played"]):
            unique_matches[key] = match

    return teams, category_teams, list(unique_matches.values()), standings


def generate_sql(input_path: Path, output_path: Path, start_date: str) -> dict:
    teams, category_teams, matches, standings = parse_workbook(input_path)
    lines = [
        "-- Importación generada desde Torneo Apertura 2025-2026.xlsx",
        "-- Las fechas/horarios son provisionales: el archivo fuente no contiene calendario real.",
        "-- Cambia @fecha_inicio antes de ejecutar si ya conoces la fecha de inicio.",
        "USE liga_estrellas;",
        "SET NAMES utf8mb4;",
        f"SET @fecha_inicio = {sql(start_date)};",
        "START TRANSACTION;",
        "",
        "-- Equipos",
    ]

    for name in teams.values():
        lines.append(
            f"INSERT INTO equipos (nombre) SELECT {sql(name)} "
            f"WHERE NOT EXISTS (SELECT 1 FROM equipos WHERE UPPER(TRIM(nombre))=UPPER(TRIM({sql(name)})) LIMIT 1);"
        )

    lines.extend(["", "-- Categorías y asignaciones"])
    for category, team_keys in category_teams.items():
        lines.append(f"INSERT IGNORE INTO categorias (nombre) VALUES ({sql(category)});")
        for key in sorted(team_keys, key=lambda item: teams[item]):
            name = teams[key]
            lines.append(
                "INSERT IGNORE INTO equipo_categoria (equipo_id,categoria_id) "
                f"SELECT e.id,c.id FROM equipos e JOIN categorias c ON c.nombre={sql(category)} "
                f"WHERE UPPER(TRIM(e.nombre))=UPPER(TRIM({sql(name)})) LIMIT 1;"
            )

    lines.extend(["", "-- Jornadas"])
    jornadas = sorted({(m["category"], m["jornada"]) for m in matches})
    for category, jornada in jornadas:
        lines.append(f"INSERT IGNORE INTO jornadas (nombre) VALUES ({sql(f'{category} - Jornada {jornada}')});")

    lines.extend(["", "-- Partidos"])
    for match in matches:
        category = match["category"]
        local = teams[match["local"]]
        visit = teams[match["visit"]]
        jornada_name = f"{category} - Jornada {match['jornada']}"
        day_offset = (match["jornada"] - 1) * 7
        hour_offset = 8 + min(match["order"], 12)
        date_expr = (
            f"DATE_ADD(DATE_ADD(@fecha_inicio, INTERVAL {day_offset} DAY), "
            f"INTERVAL {hour_offset} HOUR)"
        )
        goals_l = str(match["score_l"]) if match["played"] else "NULL"
        goals_v = str(match["score_v"]) if match["played"] else "NULL"
        state = "jugado" if match["played"] else "programado"
        comment = (
            "Importado desde Excel; fecha provisional"
            + (f"; estado fuente: {match['source_state']}" if match["source_state"] else "")
        )
        lines.append(
            "INSERT INTO partidos "
            "(equipo_categoria_local_id,equipo_categoria_visita_id,jornada_id,fecha,"
            "goles_local,goles_visita,comentario,estado) "
            "SELECT ecl.id,ecv.id,j.id,"
            f"{date_expr},{goals_l},{goals_v},{sql(comment)},{sql(state)} "
            "FROM equipo_categoria ecl "
            "JOIN equipos el ON el.id=ecl.equipo_id "
            "JOIN categorias c ON c.id=ecl.categoria_id "
            "JOIN equipo_categoria ecv ON ecv.categoria_id=c.id "
            "JOIN equipos ev ON ev.id=ecv.equipo_id "
            f"JOIN jornadas j ON j.nombre={sql(jornada_name)} "
            f"WHERE c.nombre={sql(category)} "
            f"AND UPPER(TRIM(el.nombre))=UPPER(TRIM({sql(local)})) "
            f"AND UPPER(TRIM(ev.nombre))=UPPER(TRIM({sql(visit)})) "
            "AND NOT EXISTS (SELECT 1 FROM partidos p "
            "WHERE p.equipo_categoria_local_id=ecl.id "
            "AND p.equipo_categoria_visita_id=ecv.id AND p.jornada_id=j.id) LIMIT 1;"
        )

    lines.extend(["", "-- Tabla de posiciones (valores oficiales del Excel)"])
    for standing in standings:
        name = teams[standing["team"]]
        lines.append(
            "INSERT INTO tabla_posiciones (equipo_categoria_id,pj,g,e,p,gf,gc,puntos) "
            "SELECT ec.id,"
            f"{standing['pj']},{standing['g']},{standing['e']},{standing['p']},"
            f"{standing['gf']},{standing['gc']},{standing['points']} "
            "FROM equipo_categoria ec JOIN equipos e ON e.id=ec.equipo_id "
            "JOIN categorias c ON c.id=ec.categoria_id "
            f"WHERE c.nombre={sql(standing['category'])} "
            f"AND UPPER(TRIM(e.nombre))=UPPER(TRIM({sql(name)})) LIMIT 1 "
            "ON DUPLICATE KEY UPDATE pj=VALUES(pj),g=VALUES(g),e=VALUES(e),p=VALUES(p),"
            "gf=VALUES(gf),gc=VALUES(gc),puntos=VALUES(puntos);"
        )

    lines.extend(["", "COMMIT;", ""])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text("\n".join(lines), encoding="utf-8")
    return {
        "teams": len(teams),
        "categories": len(category_teams),
        "assignments": sum(len(items) for items in category_teams.values()),
        "matches": len(matches),
        "played": sum(1 for item in matches if item["played"]),
        "scheduled": sum(1 for item in matches if not item["played"]),
        "standings": len(standings),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("database/import_torneo_apertura_2025_2026.sql"),
    )
    parser.add_argument("--start-date", default="2025-08-02")
    args = parser.parse_args()
    summary = generate_sql(args.input, args.output, args.start_date)
    print(f"SQL generado: {args.output.resolve()}")
    print(" | ".join(f"{key}={value}" for key, value in summary.items()))


if __name__ == "__main__":
    main()
