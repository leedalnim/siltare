# 배포 전에 실행: index.html의 css/js 주소 뒤 ?v= 를 새 값으로 바꿔서 폰이 예전 파일을 쓰지 않게 해요.
import re, time, pathlib
p = pathlib.Path(__file__).resolve().parent.parent / "index.html"
v = time.strftime("%Y%m%d%H%M")
s = re.sub(r'((?:href|src)="(?:css|js)/[^"?]+\.(?:css|js))(?:\?v=[^"]*)?"', rf'\1?v={v}"', p.read_text())
p.write_text(s); print("version", v)
