export type Page = 'feed' | 'stocks' | 'onboarding' | 'notifications' | 'settings' | 'detail' | 'ai' | 'timeline';
export type Scenario = '' | 'nostocks' | 'nochanges' | 'error' | 'nodoc' | 'noai';
export interface Company {
    id: number;
    name: string;
    code: string;
    sector: string;
    color: string;
    logo?: string;
    website: string;
    market?: 'KOSPI' | 'US';
    marketRank?: number;
    initials?: string;
}
export interface Disclosure {
    id: number;
    companyId: number;
    title: string;
    report: '분기' | '반기' | '사업';
    kind: '정정' | '신규';
    metric: string;
    before: number;
    after: number;
    unit: string;
    time: string;
    date: string;
    note: string;
    comparable: boolean;
    previousText?: string[];
    correctedText?: string[];
    correctionReason?: string;
}
export const companies: Company[] = [
{"id":0,"name":"삼성전자","code":"005930","sector":"반도체 · IT","color":"samsung","logo":"samsung","website":"https://www.samsung.com/sec/","market":"KOSPI","marketRank":1},
{"id":1,"name":"NAVER","code":"035420","sector":"인터넷 · AI","color":"naver","logo":"naver","website":"https://www.navercorp.com/","market":"KOSPI"},
{"id":2,"name":"카카오","code":"035720","sector":"플랫폼 · 서비스","color":"kakao","logo":"kakao","website":"https://www.kakaocorp.com/","market":"KOSPI"},
{"id":3,"name":"현대자동차","code":"005380","sector":"자동차 · 모빌리티","color":"hyundai","logo":"hyundai","website":"https://www.hyundai.com/","market":"KOSPI","marketRank":8},
{"id":4,"name":"기아","code":"000270","sector":"자동차 · 모빌리티","color":"kia","logo":"kia","website":"https://www.kia.com/","market":"KOSPI","marketRank":14},
{"id":5,"name":"LG전자","code":"066570","sector":"가전 · 전자","color":"lg","logo":"lg","website":"https://www.lg.com/","market":"KOSPI"},
{"id":6,"name":"NVIDIA","code":"NVDA","sector":"미국 · AI 반도체","color":"nvidia","logo":"nvidia","website":"https://investor.nvidia.com/","market":"US","marketRank":1},
{"id":7,"name":"Apple","code":"AAPL","sector":"미국 · IT 기기","color":"apple","logo":"apple","website":"https://investor.apple.com/","market":"US","marketRank":2},
{"id":8,"name":"Tesla","code":"TSLA","sector":"미국 · 전기차 · 에너지","color":"tesla","logo":"tesla","website":"https://ir.tesla.com/","market":"US","marketRank":9},
{"id":9,"name":"SK하이닉스","code":"000660","sector":"반도체 · 메모리","color":"blue","initials":"SK","website":"https://www.skhynix.com/","market":"KOSPI","marketRank":2},
{"id":10,"name":"삼성전자우","code":"005935","sector":"반도체 · IT · 우선주","color":"blue","initials":"삼우","website":"https://www.samsung.com/sec/","market":"KOSPI","marketRank":3},
{"id":11,"name":"SK스퀘어","code":"402340","sector":"지주 · 투자","color":"purple","initials":"SK","website":"https://www.sksquare.com/","market":"KOSPI","marketRank":4},
{"id":12,"name":"삼성전기","code":"009150","sector":"전자부품 · MLCC","color":"blue","initials":"전기","website":"https://www.samsungsem.com/","market":"KOSPI","marketRank":5},
{"id":13,"name":"LG에너지솔루션","code":"373220","sector":"배터리 · 에너지","color":"green","initials":"LG","website":"https://www.lgensol.com/","market":"KOSPI","marketRank":6},
{"id":14,"name":"삼성바이오로직스","code":"207940","sector":"바이오 · 위탁생산","color":"green","initials":"바이","website":"https://samsungbiologics.com/","market":"KOSPI","marketRank":7},
{"id":15,"name":"KB금융","code":"105560","sector":"금융 · 지주","color":"yellow","initials":"KB","website":"https://www.kbfg.com/","market":"KOSPI","marketRank":9},
{"id":16,"name":"삼성생명","code":"032830","sector":"금융 · 보험","color":"blue","initials":"생명","website":"https://www.samsunglife.com/","market":"KOSPI","marketRank":10},
{"id":17,"name":"삼성물산","code":"028260","sector":"지주 · 건설 · 상사","color":"blue","initials":"물산","website":"https://www.samsungcnt.com/","market":"KOSPI","marketRank":11},
{"id":18,"name":"셀트리온","code":"068270","sector":"바이오 · 제약","color":"green","initials":"셀","website":"https://www.celltrion.com/","market":"KOSPI","marketRank":12},
{"id":19,"name":"삼성SDI","code":"006400","sector":"배터리 · 전자재료","color":"blue","initials":"SDI","website":"https://www.samsungsdi.com/","market":"KOSPI","marketRank":13},
{"id":20,"name":"신한지주","code":"055550","sector":"금융 · 지주","color":"purple","initials":"신한","website":"https://www.shinhangroup.com/","market":"KOSPI","marketRank":15},
{"id":21,"name":"한화에어로스페이스","code":"012450","sector":"방산 · 항공우주","color":"orange","initials":"한화","website":"https://www.hanwhaaerospace.com/","market":"KOSPI","marketRank":16},
{"id":22,"name":"SK","code":"034730","sector":"지주 · 투자","color":"purple","initials":"SK","website":"https://www.sk-inc.com/","market":"KOSPI","marketRank":17},
{"id":23,"name":"두산에너빌리티","code":"034020","sector":"에너지 · 발전설비","color":"orange","initials":"두산","website":"https://www.doosanenerbility.com/","market":"KOSPI","marketRank":18},
{"id":24,"name":"하나금융지주","code":"086790","sector":"금융 · 지주","color":"blue","initials":"하나","website":"https://www.hanafn.com/","market":"KOSPI","marketRank":19},
{"id":25,"name":"현대모비스","code":"012330","sector":"자동차부품 · 모빌리티","color":"blue","initials":"모비","website":"https://www.mobis.com/","market":"KOSPI","marketRank":20},
{"id":26,"name":"Microsoft","code":"MSFT","sector":"미국 · 소프트웨어 · AI","color":"blue","initials":"MS","website":"https://www.microsoft.com/","market":"US","marketRank":3},
{"id":27,"name":"Alphabet","code":"GOOGL","sector":"미국 · 인터넷 · AI","color":"blue","initials":"G","website":"https://abc.xyz/","market":"US","marketRank":4},
{"id":28,"name":"Amazon","code":"AMZN","sector":"미국 · 커머스 · 클라우드","color":"orange","initials":"A","website":"https://www.aboutamazon.com/","market":"US","marketRank":5},
{"id":29,"name":"SpaceX","code":"SPCX","sector":"미국 · 우주항공","color":"blue","initials":"X","website":"https://www.spacex.com/","market":"US","marketRank":6},
{"id":30,"name":"Broadcom","code":"AVGO","sector":"미국 · 반도체 · 인프라","color":"orange","initials":"B","website":"https://www.broadcom.com/","market":"US","marketRank":7},
{"id":31,"name":"Meta Platforms","code":"META","sector":"미국 · 플랫폼 · AI","color":"blue","initials":"M","website":"https://about.meta.com/","market":"US","marketRank":8},
{"id":32,"name":"Eli Lilly","code":"LLY","sector":"미국 · 제약 · 헬스케어","color":"red","initials":"L","website":"https://www.lilly.com/","market":"US","marketRank":10},
{"id":33,"name":"Micron Technology","code":"MU","sector":"미국 · 반도체 · 메모리","color":"purple","initials":"MU","website":"https://www.micron.com/","market":"US","marketRank":11},
{"id":34,"name":"Walmart","code":"WMT","sector":"미국 · 유통","color":"blue","initials":"W","website":"https://corporate.walmart.com/","market":"US","marketRank":12},
{"id":35,"name":"AMD","code":"AMD","sector":"미국 · 반도체 · 컴퓨팅","color":"green","initials":"AMD","website":"https://www.amd.com/","market":"US","marketRank":13},
{"id":36,"name":"JPMorgan Chase","code":"JPM","sector":"미국 · 금융","color":"blue","initials":"JPM","website":"https://www.jpmorganchase.com/","market":"US","marketRank":14},
{"id":37,"name":"Visa","code":"V","sector":"미국 · 결제 · 금융","color":"blue","initials":"V","website":"https://usa.visa.com/","market":"US","marketRank":15},
{"id":38,"name":"Exxon Mobil","code":"XOM","sector":"미국 · 에너지","color":"red","initials":"X","website":"https://corporate.exxonmobil.com/","market":"US","marketRank":16},
{"id":39,"name":"Johnson & Johnson","code":"JNJ","sector":"미국 · 헬스케어","color":"red","initials":"J&J","website":"https://www.jnj.com/","market":"US","marketRank":17},
{"id":40,"name":"Mastercard","code":"MA","sector":"미국 · 결제 · 금융","color":"orange","initials":"MC","website":"https://www.mastercard.com/","market":"US","marketRank":18},
{"id":41,"name":"AbbVie","code":"ABBV","sector":"미국 · 제약 · 헬스케어","color":"green","initials":"ABB","website":"https://www.abbvie.com/","market":"US","marketRank":19},
{"id":42,"name":"Intel","code":"INTC","sector":"미국 · 반도체","color":"blue","initials":"INT","website":"https://www.intel.com/","market":"US","marketRank":20}
];
export const disclosures: Disclosure[] = [
    { id: 0, companyId: 0, title: '연결 누적 매출액 정정 제출', report: '분기', kind: '정정', metric: '매출액', before: 100, after: 90, unit: '억원', time: '방금 전', date: '2026.10.30 10:42', note: '매출 인식 대상 거래와 보고 기간을 다시 확인하고 집계 기준을 맞춘 변경 사례입니다.', comparable: true, correctionReason: '일부 거래의 인식 시점과 연결 범위 검토 결과를 반영했습니다.', previousText: ['연결 손익계산서의 3분기 누적 매출액은 100억원으로 기재했습니다.', '매출액은 보고 기간에 인식된 제품 및 서비스 매출을 기준으로 집계했습니다.', '비교 기간의 매출 분류 기준은 직전 제출본과 동일하게 적용했습니다.'], correctedText: ['연결 손익계산서의 3분기 누적 매출액을 90억원으로 정정했습니다.', '일부 거래의 인식 시점을 재검토해 보고 기간별 매출 집계를 수정했습니다.', '비교 기간의 매출 분류 기준을 재확인하고 연결 범위 변경 사항을 반영했습니다.'] },
    { id: 1, companyId: 1, title: '연구개발비 자산화 내역 신규 공시', report: '사업', kind: '신규', metric: '연구개발비', before: 0, after: 18, unit: '억원', time: '57분 전', date: '2026.10.30 09:45', note: '처음 제출된 문서입니다. 직전 비교 문서가 없어 증감률을 계산하지 않습니다.', comparable: false, correctedText: ['연구개발 프로젝트별 지출 내역과 자산 인식 기준을 보고서에 추가했습니다.', '당기 중 자산으로 인식한 연구개발비는 18억원이며, 기술적 실현 가능성과 향후 효익을 기준으로 분류했습니다.', '연구 단계에서 발생한 비용은 발생한 기간의 비용으로 처리하고, 개발 단계에서 요건을 충족한 금액만 자산에 포함했습니다.'] },
    { id: 2, companyId: 2, title: '특수관계자 대여금 잔액 오기 수정', report: '반기', kind: '정정', metric: '대여금 잔액', before: 100, after: 50, unit: '억원', time: '2시간 전', date: '2026.10.30 08:30', note: '주석에 기재된 대여금 잔액과 관련 거래의 기말 잔액을 대조해 정정한 변경 사례입니다.', comparable: true, correctionReason: '주석 내 기초 잔액과 당기 회수액 반영 과정의 차이를 수정했습니다.', previousText: ['특수관계자 대여금의 기말 잔액은 100억원으로 기재했습니다.', '당기 중 회수액은 잔액 산정에 반영하지 않았습니다.', '관련 거래의 만기와 이자 조건은 주석에 별도로 기재했습니다.'], correctedText: ['특수관계자 대여금의 기말 잔액을 50억원으로 정정했습니다.', '당기 중 회수된 금액을 반영해 기말 잔액을 다시 산정했습니다.', '관련 거래의 만기, 이자 조건 및 회수 내역을 주석에 추가했습니다.'] },
    { id: 3, companyId: 3, title: '영업이익 수치 재산정', report: '분기', kind: '정정', metric: '영업이익', before: 40, after: 44, unit: '억원', time: '3시간 전', date: '2026.10.30 07:30', note: '비용 계정의 분류를 재검토하고 영업이익 계산 항목을 다시 반영한 변경 사례입니다.', comparable: true, correctionReason: '판매관리비 일부 항목의 분류 기준을 재검토했습니다.', previousText: ['분기 영업이익은 40억원으로 기재했습니다.', '판매관리비에는 해당 기간에 발생한 판관비와 기타 비용을 포함했습니다.', '영업이익은 매출총이익에서 판매관리비를 차감해 산출했습니다.'], correctedText: ['분기 영업이익을 44억원으로 정정했습니다.', '판매관리비 중 일부 항목의 계정 분류를 검토해 금액을 재배분했습니다.', '영업이익 산출표와 관련 주석의 분류 기준을 함께 수정했습니다.'] },
];
export function delta(d: Disclosure) { return d.comparable && d.before !== 0 ? (d.after - d.before) / d.before * 100 : null; }
export function percent(d: Disclosure) { const v = delta(d); return v === null ? '신규 접수' : `${v > 0 ? '+' : ''}${v.toFixed(1)}%`; }
export const titles: Record<Page, string> = { feed: '오늘의 변화', stocks: '내 관심종목', onboarding: '관심종목 등록', notifications: '알림 센터', settings: '알림 설정', detail: '공시 상세', ai: 'AI 설명 및 근거', timeline: '정정 이력' };
const baseSettings = { push: true, urgent: true, quiet: false, quietStart: '22:00', quietEnd: '08:00', mode: 'instant', business: true, half: true, quarter: true, correction: true };
export const defaultSettings = Object.assign(baseSettings, Object.fromEntries(companies.map(company => [`company${company.id}`, true]))) as typeof baseSettings & Record<`company${number}`, boolean>;
export type Settings = typeof defaultSettings;
export const scenarios: {
    id: Scenario;
    label: string;
}[] = [{ id: '', label: '기본 화면' }, { id: 'nostocks', label: '관심종목 없음' }, { id: 'nochanges', label: '새 변화 없음' }, { id: 'error', label: '수집 실패' }, { id: 'nodoc', label: '비교문서 없음' }, { id: 'noai', label: 'AI 설명 보류' }];
