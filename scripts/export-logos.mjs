import * as icons from 'simple-icons';
import fs from 'node:fs';
let notes='# 기업 로고 출처\n\nSimple Icons SVG (CC0). 각 상표권은 해당 권리자에게 있습니다.\n\n';
for(const name of ['Samsung','Naver','Kakao','Hyundai','Kia','Lg']){const i=icons['si'+name];fs.writeFileSync('public/companies/'+i.slug+'.svg',i.svg.replace('<svg ',`<svg fill="#${i.hex}" `));notes+=`- ${i.title}: ${i.source}\n`;}
fs.writeFileSync('public/companies/SOURCES.md',notes);
