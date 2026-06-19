# 문서 사이트 Vercel 배포 가이드

`apps/docs`(Next.js)를 Vercel에 배포하는 방법. 이 사이트는 정적(모든 라우트 prerender)이라 별도 런타임/환경변수가 필요 없다.

## 핵심 포인트

- 이 레포는 **pnpm workspace + Turborepo 모노레포**다. 문서 앱은 `apps/docs`에 있고, 빌드 전에 워크스페이스 의존성(`@superbase/tokens`·`@superbase/react`·`@superbase/icons`)이 먼저 빌드돼야 한다(`@superbase/tokens/css`, `@superbase/react/styles.css`를 import하므로).
- Vercel은 **Turborepo를 자동 인식**해서, 선택한 앱과 그 의존성을 함께 빌드한다.

## 추천 설정 (대시보드 — Root Directory 방식)

1. [vercel.com/new](https://vercel.com/new) 에서 GitHub 레포 `tube-jeonghoon/superbase-design-system` import.
2. **Root Directory** 를 `apps/docs` 로 설정 (Configure Project 화면 또는 Settings → Build & Development).
3. Framework Preset: **Next.js** (자동 감지됨).
4. Install/Build Command: **기본값 유지**.
   - Vercel이 `packageManager: pnpm@10.27.0`(루트 package.json)를 보고 pnpm으로 설치.
   - Turborepo 인식으로 `@superbase/docs`의 의존성(tokens/react/icons)을 먼저 빌드한 뒤 `next build` 실행.
5. **Deploy** → `https://<프로젝트명>.vercel.app` 로 게시. main에 push할 때마다 자동 재배포.

## 빌드가 의존성을 안 만들 경우 (폴백)

Turborepo 자동 빌드가 안 잡히면, 프로젝트 설정에서 명령을 오버라이드한다 (Root Directory = `apps/docs` 유지):

- **Install Command**: `cd ../.. && pnpm install --frozen-lockfile`
- **Build Command**: `cd ../.. && pnpm turbo run build --filter=@superbase/docs`
- **Output Directory**: `.next` (기본값)

또는 Root Directory를 레포 루트로 두고 루트에 `vercel.json`을 만든다:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "nextjs",
  "installCommand": "pnpm install --frozen-lockfile",
  "buildCommand": "pnpm turbo run build --filter=@superbase/docs",
  "outputDirectory": "apps/docs/.next"
}
```

## 로컬에서 프로덕션 빌드 확인

```bash
pnpm turbo run build --filter=@superbase/docs   # 의존성 + next build
pnpm --filter @superbase/docs exec next start -p 3100   # 프로덕션 서버
```

## 참고

- 환경변수: 없음.
- 노드: Vercel 프로젝트 설정에서 Node 22 권장(루트 `engines.node: ">=22"`).
- 커스텀 도메인은 Vercel 대시보드 Domains에서 연결.
