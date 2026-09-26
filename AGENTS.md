# Inline Local Graph

> 이 파일은 **AI 코딩 에이전트용 지침**입니다 (Claude Code, Codex 등). 사람 기여자에게 적용되는 규칙이 아니며, 일반 기여는 평소처럼 이슈와 PR로 하시면 됩니다.
>
> *This file contains instructions for AI coding agents. It does not apply to human contributors — issues and pull requests are welcome as usual.*

## 에이전트 작업 규칙 (planfirst)

이 저장소는 **문서 우선(SPEC → PLAN → TODO) 워크플로우**를 따릅니다.

작업을 시작하기 전에 아래 둘을 반드시 읽으세요.

1. `.ai-workflow/PROJECT.md` — 이 저장소의 브랜치·태그·Git 호스트·언어 설정
2. 워크플로우 본문 `WORKFLOW.md` — 전체 절차
   - planfirst 플러그인의 `core/WORKFLOW.md` (Claude Code 마켓플레이스 `tkoxff/planfirst-ai-workflow`)

### 즉시 적용되는 게이트

1. **사용자가 코드 작업을 시작하라고 지시하기 전까지 어떤 코드 파일도 수정하지 않습니다.** 문서 작업이 끝나면 멈추고 지시를 기다립니다. 읽기는 허용됩니다.
2. **`SPEC.md` → `PLAN.md` → `TODO.md` 순서.** `SPEC.md` 확정 전에는 `PLAN.md`도 코드도 시작하지 않습니다. 순서는 `SPEC.md` → `PLAN.md` → `TODO.md`이고, `NOTES.md`는 사용자가 기록을 지시했을 때만 만드는 선택 문서입니다. 태스크 폴더에는 이 네 문서 외의 파일을 만들지 않습니다.
3. **`SPEC.md`의 Scope 밖은 건드리지 않습니다.** 필요해 보이면 먼저 물어보세요.
4. **워크플로를 통한 모든 변경은 브랜치를 만든 뒤 적용합니다.** 코드뿐 아니라 `SPEC`·`PLAN`·`TODO`를 비롯한 문서 작업도 마찬가지입니다. 기본 브랜치에 직접 커밋하지 않으며, 완료 후 PR/MR로 병합합니다. **예외는 사용자가 브랜치 없이 직접 수정하라고 명시적으로 지시한 경우뿐입니다** — 그 통로는 `PLANFIRST_ALLOW_BASE_BRANCH=1`입니다.
5. **절차를 어겨야 한다고 판단되면, 어기기 전에 이유를 말하고 사용자에게 묻습니다.** 규모가 작아서·급해서·실익이 없어 보여서 — 어떤 이유든 임의로 건너뛰지 않습니다. **사후 보고는 이 원칙을 만족하지 않습니다** — 실행 전에 묻습니다.

브랜치명·태그 접두사·PR 생성 명령·이슈 종료 방법은 기억이나 관행으로 정하지 말고 `.ai-workflow/PROJECT.md`에서 읽은 값으로 정하세요. 설치되지 않은 CLI를 호출하지 마세요.
