from datetime import date, datetime, time, timedelta


def rango_del_dia(fecha: date) -> tuple[datetime, datetime]:
    inicio = datetime.combine(fecha, time.min)
    return inicio, inicio + timedelta(days=1)
