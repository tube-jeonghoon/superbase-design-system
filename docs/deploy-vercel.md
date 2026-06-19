# 문서 사이트 Vercel 배포

`apps/docs`(Next.js)는 Vercel에 배포되어 있다. 정적 사이트(모든 라우트 prerender)라 런타임/환경변수가 없다.

## 라이브

- **프로덕션**: https://design-library-six.vercel.app
- **Git 연동**: `tube-jeonghoon/superbase-design-system`, production branch `main` → **main에 push할 때마다 자동 배포**.

## 프로젝트 설정 (이미 적용됨)

이 모노레포(pnpm + Turborepo)에서 문서 앱은 `apps/docs`에 있고, 빌드 전에 워크스페이스 의존성(`@superbase/tokens`·`@superbase/react`·`@superbase/icons`)이 먼저 빌드돼야 한다. 작동하는 설정:

- **Root Directory** = `apps/docs` (프로젝트 설정 — `apps/docs/package.json`의 `next`를 인식)
- **Output Directory** = 기본 `.next` (Root Directory 기준 상대 경로. `apps/docs/.next` 같은 절대 표기를 쓰면 경로가 이중으로 잡혀 실패함)
- **빌드/설치 오버라이드** = `apps/docs/vercel.json`:
  ```json
  {
    "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
    "buildCommand": "cd ../.. && pnpm turbo run build --filter=@superbase/docs"
  }
  ```
  (Root Directory가 `apps/docs`이므로 `cd ../..`로 레포 루트에서 turbo가 의존성→docs 순으로 빌드.)
- **Vercel Authentication(Deployment Protection)** = 꺼짐 (공개 문서 사이트).

> 루트에 `vercel.json`을 두고 `framework: nextjs`로 잡으면 루트 package.json에 `next`가 없어 "No Next.js detected"로 실패한다. 반드시 Root Directory를 `apps/docs`로.

## 처음부터 다시 연결할 때 (참고)

1. `vercel link` 또는 [vercel.com/new](https://vercel.com/new) 에서 레포 import.
2. **Root Directory = `apps/docs`** 설정. Framework: Next.js(자동).
3. Output Directory는 기본값(`.next`) 유지.
4. 공개로 쓰려면 Settings → Deployment Protection에서 Vercel Authentication 끄기.

## 로컬 프로덕션 확인

```bash
pnpm turbo run build --filter=@superbase/docs
pnpm --filter @superbase/docs exec next start -p 3100
```
