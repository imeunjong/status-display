# 상태표시

커플끼리 현재 **상태**(집/학교/운동중/쉬는중/공강/자는중) × **기분**(나쁨/슬픔/기쁨/화남/즐거움/건들지마)을 공유하는 PWA.

- 6 상태 × 6 기분 = 36 조합으로 상대에게 표시
- 누르면 상대 폰에 **웹푸시 알림** 도착
- 초대코드 1회 입력으로 평생 페어링

## 스택
- Next.js 14 (App Router) / TypeScript / Tailwind
- Supabase (Postgres) — DB 전용, RLS off (서비스롤 서버 사이드)
- Web Push (VAPID) — Service Worker + `web-push`

## 셋업

### 1. 의존성 설치
```bash
npm install
```

### 2. Supabase
1. [supabase.com](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `supabase/schema.sql` 실행
3. Settings → API 에서 키 가져오기

### 3. VAPID 키 생성
```bash
npm run vapid
```
출력된 3줄을 `.env.local`에 붙여넣기.

### 4. `.env.local` 작성
`.env.local.example` 복사해서 채움:
```
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:your@email
```

### 5. 개발 서버
```bash
npm run dev
```

## 배포 (Vercel)
1. GitHub에 푸시
2. Vercel에서 import
3. 환경변수 위 6개 그대로 입력
4. 배포

## 사용 방법
1. 각자 닉네임 입력 → 6자리 초대코드 발급
2. 한 명이 상대 코드를 입력 → 페어링 완료
3. 홈에서 상태/기분 버튼 누르면 즉시 반영 + 상대 폰에 푸시

## 푸시 알림 주의사항
- **iOS**: Safari 16.4+ 에서 **홈 화면에 추가** 한 PWA에서만 동작. 그냥 사파리에서는 안 옴.
- **Android Chrome**: 그냥 동작
- 데스크톱: 브라우저 켜져 있으면 동작

## 아이콘 교체
`public/icon-192.png`, `public/icon-512.png` 는 placeholder. 실제 디자인으로 교체 권장.

## 데이터 모델
- `users` — `id`, `nickname`, `invite_code`, `partner_id`, `current_status`, `current_mood`, `push_subscription`
- `status_logs` — 상태 변경 히스토리

## 폴더
```
app/            # Next.js App Router
  api/          # 서버 라우트
  onboarding/   # 닉네임 입력
  pair/         # 초대코드 페어링
  home/         # 메인 (6+6 버튼)
lib/            # 공용 유틸
public/         # sw.js, manifest, icons
supabase/       # 스키마 SQL
scripts/        # VAPID/아이콘 생성기
```
