# TROUBLE.md — 누적 트러블슈팅 지식베이스

---

## [v0.9.7] Phase 1/2 변경사항이 같은 파일에 혼재 → 부분 스테이징 불가

**발생 시점**: v0.9.7 커밋 작업

**상황**: Phase 1(코드 정리)과 Phase 2(기능 추가) 작업을 분리 커밋하려 했으나, 두 작업이 동일한 `.ts` 파일 내에 혼재되어 파일 단위 스테이징으로는 분리 불가.

**원인**: 작업 순서를 Phase별로 분리하지 않고 한 번에 진행한 것.

**해결**: `styles.css`(Phase 1 전용)만 별도 커밋하고, 나머지는 하나의 커밋으로 묶음. `git add -p`(인터랙티브 hunk 선택)로 부분 스테이징이 가능하지만 Claude Code에서는 인터랙티브 터미널이 필요해 직접 실행 불가 — 사용자가 직접 수행해야 함.

**예방책**: 다음 버전부터는 Phase 1(코드 정리) 작업을 먼저 커밋한 뒤 Phase 2(기능 추가)를 진행하도록 순서를 지킬 것.

---

## [v0.9.7] `.ai-agent/` git add 시 .gitignore 오류

**발생 시점**: v0.9.7 스테이징 작업

**상황**: `git add .ai-agent/` 실행 시 `.gitignore`에 등록되어 있어 에러 발생.

```
The following paths are ignored by one of your .gitignore files: .ai-agent
```

**원인**: `.ai-agent/`가 `.gitignore`에 의도적으로 등록되어 있음 (내부 작업 문서는 원격에 올리지 않는 정책).

**해결**: `.ai-agent/`는 스테이징 대상에서 제외. 정상 동작.

---

## [v0.9.7] gh CLI 미설치로 PR 생성 실패

**발생 시점**: v0.9.7 PR 생성

**상황**: `gh pr create` 실행 시 `command not found: gh` 오류.

**해결**: `brew install gh` 후 `gh auth login`으로 인증. 이후 정상 동작.

**참고**: gh CLI는 `/usr/local/bin/gh`에 설치됨, 인증 완료 상태.

---

## [v0.9.8] GitHub Release 태그에 `v` 접두사 붙여서 Obsidian 업데이트 실패

**발생 시점**: v0.9.8 릴리즈 등록 후 Obsidian 앱에서 플러그인 업데이트 시도

**상황**: Obsidian 앱에서 "Failed to update" / "Failed to install Plugin" 에러 발생. 개발자 도구(Cmd+Option+I) 콘솔에서 `Error: Request failed, status 404` 확인.

**원인**: 릴리즈 태그를 `v0.9.8`로 생성했으나, 기존 릴리즈들은 모두 `0.9.7`, `0.9.6` 등 **`v` 접두사 없이** 생성되어 있었음. Obsidian은 태그 형식이 일관되어야 하며, 기존과 다른 형식의 태그로는 릴리즈 에셋을 찾지 못해 404 발생.

**해결**: `v0.9.8` 릴리즈 및 태그를 삭제하고 `0.9.8`(v 없음)로 재생성.

```bash
gh release delete v0.9.8 --yes
git push origin --delete v0.9.8
gh release create 0.9.8 --title "0.9.8" --notes "..." manifest.json main.js styles.css
```

**예방책**: 릴리즈 태그 생성 시 반드시 기존 태그 형식을 확인하고 동일한 형식을 사용할 것. 이 프로젝트에서는 **`v` 접두사 없이 버전 번호만** 사용 (예: `0.9.8`).

---

## [v0.9.9] 버전업 시 `npm version` 자동 커밋/태그 주의

**발생 시점**: v0.9.9 마무리(버전 반영) 작업

**상황**: `package.json`의 `version` 스크립트가 `node version-bump.mjs && git add manifest.json versions.json`로 설정되어 있음. `npm version 0.9.9`을 쓰면 이 스크립트 실행 후 **npm이 자동으로 커밋과 git 태그까지 생성**한다. 이번에는 커밋 단위를 직접 통제하고 싶었기에 자동 태그가 오히려 방해.

**해결**: `npm version`을 쓰지 않고 `manifest.json` / `package.json` / `versions.json` 세 파일을 직접 수정한 뒤, 별도로 `chore: release` 커밋을 수동 생성.

**예방책**: 커밋/태그 시점을 직접 통제해야 하는 상황에서는 `npm version` 대신 세 파일을 수동 수정한다. 참고로 **브랜치명은 `feature/v0.9.9`(v 있음)**, **릴리즈 태그는 `0.9.9`(v 없음)** 로 접두사 규칙이 서로 다르니 혼동 주의(위 v0.9.8 항목 참조).
