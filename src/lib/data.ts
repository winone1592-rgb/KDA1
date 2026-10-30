export type Page = 'feed' | 'stocks' | 'onboarding' | 'notifications' | 'settings' | 'detail' | 'ai' | 'timeline';
export type Scenario = '' | 'nostocks' | 'nochanges' | 'error' | 'nodoc' | 'noai';
export interface Company {
    id: number;
    name: string;
    code: string;
    sector: string;
    color: string;
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
}
export const companies: Company[] = [
    { id: 0, name: '가상기업 A', code: 'DEMO-A', sector: '반도체 · IT', color: 'yellow' },
    { id: 1, name: '가상기업 B', code: 'DEMO-B', sector: '바이오 · 헬스케어', color: 'green' },
    { id: 2, name: '가상기업 C', code: 'DEMO-C', sector: '플랫폼 · 서비스', color: 'purple' },
    { id: 3, name: '가상기업 D', code: 'DEMO-D', sector: '에너지 · 소재', color: 'orange' },
    { id: 4, name: '가상기업 E', code: 'DEMO-E', sector: '모빌리티', color: 'blue' },
    { id: 5, name: '가상기업 F', code: 'DEMO-F', sector: '소비재', color: 'pink' },
];
export const disclosures: Disclosure[] = [
    { id: 0, companyId: 0, title: '연결 누적 매출액 정정 제출', report: '분기', kind: '정정', metric: '매출액', before: 100, after: 90, unit: '억원', time: '방금 전', date: '2026.10.30 10:42', note: '연결 매출액 집계 오류를 바로잡은 가상 정정 사례입니다.', comparable: true },
    { id: 1, companyId: 1, title: '연구개발비 자산화 내역 신규 공시', report: '사업', kind: '신규', metric: '연구개발비', before: 0, after: 18, unit: '억원', time: '57분 전', date: '2026.10.30 09:45', note: '처음 제출된 문서입니다. 직전 비교 문서가 없어 증감률을 계산하지 않습니다.', comparable: false },
    { id: 2, companyId: 2, title: '특수관계자 대여금 잔액 오기 수정', report: '반기', kind: '정정', metric: '대여금 잔액', before: 100, after: 50, unit: '억원', time: '2시간 전', date: '2026.10.30 08:30', note: '주석에 기재된 대여금 잔액 오기를 수정한 가상 사례입니다.', comparable: true },
    { id: 3, companyId: 3, title: '영업이익 수치 재산정', report: '분기', kind: '정정', metric: '영업이익', before: 40, after: 44, unit: '억원', time: '3시간 전', date: '2026.10.30 07:30', note: '비용 분류 조정으로 영업이익을 재산정한 가상 사례입니다.', comparable: true },
];
export function delta(d: Disclosure) { return d.comparable && d.before !== 0 ? (d.after - d.before) / d.before * 100 : null; }
export function percent(d: Disclosure) { const v = delta(d); return v === null ? '신규 접수' : `${v > 0 ? '+' : ''}${v.toFixed(1)}%`; }
export const titles: Record<Page, string> = { feed: '오늘의 변화', stocks: '내 관심종목', onboarding: '관심종목 등록', notifications: '알림 센터', settings: '알림 설정', detail: '공시 상세', ai: 'AI 설명 및 근거', timeline: '정정 이력' };
export const defaultSettings = { push: true, urgent: true, quiet: false, quietStart: '22:00', quietEnd: '08:00', mode: 'instant', business: true, half: true, quarter: true, correction: true, company0: true, company1: true, company2: true, company3: true, company4: true, company5: true };
export type Settings = typeof defaultSettings;
export const scenarios: {
    id: Scenario;
    label: string;
}[] = [{ id: '', label: '기본 화면' }, { id: 'nostocks', label: '관심종목 없음' }, { id: 'nochanges', label: '새 변화 없음' }, { id: 'error', label: '수집 실패' }, { id: 'nodoc', label: '비교문서 없음' }, { id: 'noai', label: 'AI 설명 보류' }];
