# PLAN: v0.9.7 릴리즈 계획

## 현재 상태

- **현재 버전**: 0.9.6 (manifest.json)
- **다음 버전**: 0.9.7
- **열린 이슈**: [#6 Expose node style](https://github.com/TKOxff/obsidian-inline-local-graph/issues/6)
- **기존 TODO**: 그래프 하단 100% 차지하도록 수정

---

## GitHub Issue #6: Expose node style

**요청자**: lewisevelyn (2026-02-09)
**내용**: 노드의 CSS 스타일 커스터마이징 기능 요청
- 원형 노드가 어색하게 보임
- 긴 이름의 노드가 겹쳐 보이는 문제 → 텍스트 길이 제한 필요

### 대응 방안

1. **노드 라벨 길이 제한** — `InlineGraphView.ts`
   - 노드 라벨이 일정 길이(예: 20자)를 초과하면 말줄임(...) 처리
   - 설정에 `maxLabelLength` 옵션 추가

2. **노드 폰트 크기 설정** — `InlineGraphSettingTab.ts`
   - `nodeFontSize` 설정 추가 (기본값: 14)
   - vis-network의 `nodes.font.size` 옵션에 반영

3. **노드 형태 설정** — `InlineGraphSettingTab.ts`
   - `nodeShape` 설정 추가 (ellipse, box, circle, dot 등)
   - vis-network의 `nodes.shape` 옵션에 반영

---

## 기존 TODO: 그래프 하단 100% 너비

**내용**: 인라인 그래프 하단이 전체 너비를 차지하도록 수정
- 현재 `styles.css`의 `.inline-graph-vis`는 `width: 100%`이지만 컨테이너 패딩 등으로 인해 실제로 100%가 안 될 수 있음
- `.inline-graph-container` 스타일 검토 및 수정

---

## 코드 품질 개선 (v0.9.7에 포함)

### P1: 버그/안정성

1. **미사용 `leaf` 프로퍼티 제거** — `InlineGraphView.ts:6`
   - `private leaf: WorkspaceLeaf | null = null;` 어디에서도 사용되지 않음
   - 관련 import `WorkspaceLeaf`도 제거

2. **`getNodeDistance` / `getSpringLength` 중복 정의** — `InlineGraphView.ts`
   - `createZoomControls()`과 `renderGraph()` 양쪽에 동일 함수가 정의됨
   - 클래스 레벨 private static 메서드로 통합

3. **console.debug 정리**
   - `main.ts`, `InlineGraphSettingTab.ts`에 개발용 로그가 남아있음
   - 프로덕션 빌드에서는 불필요

### P2: 코드 정리

4. **`nodeBgColor` 프로퍼티 제거** — `InlineGraphSettingTab.ts:6`
   - 클래스에 `nodeBgColor: string` 선언되어 있지만 사용되지 않음

5. **styles.css의 미사용 규칙 정리**
   - `.inline-graph-backlink-row` 클래스가 CSS에 정의되어 있지만 코드에서 사용되지 않음

---

## 작업 순서

### Phase 1: 코드 정리 및 버그 수정

| # | 작업 | 파일 | 난이도 |
|---|------|------|--------|
| 1 | 미사용 `leaf` 프로퍼티 및 `WorkspaceLeaf` import 제거 | `InlineGraphView.ts` | 낮음 |
| 2 | 미사용 `nodeBgColor` 프로퍼티 제거 | `InlineGraphSettingTab.ts` | 낮음 |
| 3 | `getNodeDistance`/`getSpringLength` 중복 제거 | `InlineGraphView.ts` | 낮음 |
| 4 | 미사용 CSS 규칙(`.inline-graph-backlink-row`) 제거 | `styles.css` | 낮음 |
| 5 | console.debug 제거 또는 조건부 로깅 전환 | `main.ts`, `InlineGraphSettingTab.ts` | 낮음 |

### Phase 2: Issue #6 대응 — 노드 스타일 커스터마이징

| # | 작업 | 파일 | 난이도 |
|---|------|------|--------|
| 6 | 노드 라벨 길이 제한 (말줄임 처리) | `InlineGraphView.ts` | 낮음 |
| 7 | 노드 폰트 크기 설정 추가 | `main.ts`, `InlineGraphView.ts`, `InlineGraphSettingTab.ts` | 중간 |
| 8 | 노드 형태(shape) 설정 추가 | `main.ts`, `InlineGraphView.ts`, `InlineGraphSettingTab.ts` | 중간 |

### Phase 3: 기존 TODO 해결

| # | 작업 | 파일 | 난이도 |
|---|------|------|--------|
| 9 | 그래프 컨테이너 100% 너비 검증 및 수정 | `styles.css` | 낮음 |

### Phase 4: 릴리즈

| # | 작업 | 파일 | 난이도 |
|---|------|------|--------|
| 10 | manifest.json 버전 → 0.9.7 | `manifest.json` | 낮음 |
| 11 | package.json 버전 → 0.9.7 | `package.json` | 낮음 |
| 12 | CHANGELOG.md 작성 (영문) | `CHANGELOG.md` | 낮음 |
| 13 | docs/TODO.md 업데이트 | `docs/TODO.md` | 낮음 |
| 14 | 프로덕션 빌드 및 테스트 | - | 중간 |

---

## 결정 사항 (2026-03-15 확정)

1. **maxLabelLength 기본값**: 20자. 결과 보고 조정 가능.
2. **말줄임 적용 범위**: 중심 노드 포함 모든 노드에 적용.
3. **nodeShape 옵션**: 5개 (`ellipse`, `box`, `circle`, `dot`, `text`).
4. **console.debug**: 전부 제거.
5. **versions.json**: 기존 `1.0.0` 엔트리 제거, `"0.9.7": "0.16.0"`으로 통일.

---

## 설정 변경 요약 (v0.9.7)

### 추가되는 설정

```typescript
interface InlineGraphSettings {
  // 기존 설정...
  maxLabelLength: number;   // 노드 라벨 최대 길이 (기본: 20)
  nodeFontSize: number;     // 노드 폰트 크기 (기본: 14)
  nodeShape: string;        // 노드 형태 (기본: 'ellipse')
}
```

### 기본값

```typescript
const DEFAULT_SETTINGS = {
  // 기존...
  maxLabelLength: 20,
  nodeFontSize: 14,
  nodeShape: 'ellipse',
}
```
