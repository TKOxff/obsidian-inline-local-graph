# STUDY.md — 누적 학습 지식베이스

---

## [v0.9.7] vis-network `size` 속성 동작 방식

`nodes.size`는 모든 shape에 전역으로 적용되는 값이지만, shape마다 체감 크기가 다름.

- `ellipse`, `box`: size 영향이 적고 라벨 텍스트 크기에 따라 자동 조정됨
- `dot`, `circle`: size 값이 반지름으로 직접 적용되어 크기 체감이 큼

→ `dot` shape에서 기본값(25)이 너무 크게 보여 **`size: 5` 고정값**으로 설정. shape별 별도 size 제어가 필요하면 `nodeShape` 변경 시 조건부로 size를 다르게 적용하는 방식 고려.

---

## [v0.9.7] Obsidian 커뮤니티 플러그인 업데이트 배포 흐름

- **최초 등록 (1회)**: `obsidian-releases` 저장소에 PR 제출 → 커뮤니티 플러그인 목록 등재
- **이후 버전 업데이트**: `obsidian-releases` PR 불필요. 본인 저장소에 **GitHub Release** 생성으로 충분.
- Obsidian 앱이 주기적으로 각 플러그인 저장소의 `manifest.json`과 GitHub Releases를 폴링하여 업데이트 알림을 표시함.
- Release 첨부 필수 파일: `main.js`, `manifest.json`, `styles.css`

---

## [v0.9.7] GitHub Branch Ruleset 설정

master 브랜치 직접 push 차단을 위한 Ruleset 설정:

- **경로**: Settings → Branches → Add branch ruleset
- **Target branches**: `Include default branch` 선택
- **Bypass list**: 개인 프로젝트에서는 비워도 무방
- **핵심 Rules**:
  - `Restrict deletions` — 브랜치 삭제 방지
  - `Require a pull request before merging` — 직접 push 차단 (Required approvals: 0으로 설정 시 리뷰어 없이도 PR 머지 가능)
  - `Block force pushes` — force push 차단

---

## [v0.9.7] `git add -p` 인터랙티브 스테이징

파일 내 변경사항을 hunk 단위로 선택적으로 스테이징하는 방법.

```bash
git add -p <파일명>
# y: 해당 hunk 스테이징
# n: 스킵
# s: hunk 더 잘게 분할
# q: 종료
```

Claude Code에서는 인터랙티브 터미널이 필요해 직접 실행 불가. 사용자가 직접 수행해야 함.

→ 이를 피하려면 **Phase별로 작업을 분리하여 순차 커밋**하는 습관이 중요.
