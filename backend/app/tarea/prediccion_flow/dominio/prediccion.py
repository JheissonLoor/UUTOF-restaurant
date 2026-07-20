from typing import Literal


TipoRecomendacion = Literal["comprar", "staff", "menu"]
AccionRecomendacion = Literal["aceptar", "descartar"]


def calcular_confianza(muestras: int) -> float:
    if muestras <= 0:
        return 55.0
    return min(95.0, round(58 + muestras * 1.25, 1))


def detectar_picos(pronostico: list[dict[str, float | str]]) -> list[str]:
    candidatos = sorted(
        (
            (int(str(punto["hora"]).split(":")[0]), float(punto["demanda"]))
            for punto in pronostico
            if float(punto["demanda"]) > 0
        ),
        key=lambda item: (-item[1], item[0]),
    )
    picos: list[int] = []
    for hora, _ in candidatos:
        if all(abs(hora - existente) > 1 for existente in picos):
            picos.append(hora)
        if len(picos) == 2:
            break
    return [f"{hora:02d}-{min(hora + 2, 24):02d}h" for hora in sorted(picos)]
