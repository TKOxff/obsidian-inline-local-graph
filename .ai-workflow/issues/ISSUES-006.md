# Issue #6: Expose node style

> **링크**: https://github.com/TKOxff/obsidian-inline-local-graph/issues/6
> **요청자**: lewisevelyn | **등록일**: 2026-02-09 | **상태**: Closed (v0.9.7, PR #7)

---

## 요청 내용 요약

플러그인의 심플함은 좋지만, 노드 렌더링의 CSS 커스터마이징이 필요하다는 요청.

**핵심 문제 2가지:**
1. 원형(ellipse) 노드가 어색하게 보임 → 노드 형태 변경 옵션 필요
2. 긴 이름의 노드가 겹쳐 보임 → 텍스트 길이 제한(truncation) 필요

---

## 현재 코드 분석

### 노드 스타일 관련 코드 (`InlineGraphView.ts`)

- **노드 형태**: `nodes.shape`가 `'ellipse'`로 하드코딩 (line 196)
- **폰트 크기**: vis-network 기본값 사용 (명시적 설정 없음)
- **라벨**: `file.basename` 그대로 사용, 길이 제한 없음 (line 130, 151, 167)
- **노드 색상**: `nodeBgColor` 설정으로 변경 가능 (이미 구현됨)

### vis-network에서 지원하는 노드 shape 옵션

- `ellipse`, `circle`, `box`, `text`, `dot`, `diamond`, `star`, `triangle`, `square`
- 사용자 친화적으로 주요 옵션만 노출: `ellipse`, `box`, `circle`, `dot`, `text`

---

## 대응 전략

### 1. 노드 라벨 길이 제한 (말줄임 처리)

**변경 파일**: `main.ts`, `InlineGraphView.ts`, `InlineGraphSettingTab.ts`

- `maxLabelLength` 설정 추가 (기본값: 20)
- 라벨 생성 시 초과분을 `...`으로 truncate
- 적용 위치: 아웃고잉 링크, 백링크 노드 모두 (현재 노트 제외)

```typescript
// 적용 예시
const truncate = (s: string, max: number) =>
  s.length > max ? s.slice(0, max) + '...' : s;
const label = truncate(targetName, this.getSettings().maxLabelLength);
```

### 2. 노드 폰트 크기 설정

**변경 파일**: `main.ts`, `InlineGraphView.ts`, `InlineGraphSettingTab.ts`

- `nodeFontSize` 설정 추가 (기본값: 14)
- vis-network options의 `nodes.font.size`에 반영

```typescript
// 적용 위치: renderGraph()의 options
nodes: { shape: '...', color: nodeBgColor, font: { color: '#fff', size: nodeFontSize } }
```

### 3. 노드 형태(shape) 설정

**변경 파일**: `main.ts`, `InlineGraphView.ts`, `InlineGraphSettingTab.ts`

- `nodeShape` 설정 추가 (기본값: `'ellipse'`)
- 설정 탭에 드롭다운 UI 제공
- 선택 가능 옵션: `ellipse`, `box`, `circle`, `dot`, `text`

```typescript
// 설정 탭 UI
new Setting(containerEl)
  .setName('Node shape')
  .setDesc('Set the shape of graph nodes.')
  .addDropdown(dropdown => dropdown
    .addOptions({ ellipse: 'Ellipse', box: 'Box', circle: 'Circle', dot: 'Dot', text: 'Text' })
    .setValue(this.plugin.settings.nodeShape)
    .onChange(async (value) => { ... }));
```

---

## 대응 버전

**v0.9.7**에 포함하여 릴리즈 예정. 상세 작업 체크리스트는 `.ai-agent/v0.9.7/TODO.md` 참조.

---

## 이슈 종료 조건

- [x] 노드 라벨 말줄임 동작 확인
- [x] 노드 폰트 크기 변경 동작 확인
- [x] 노드 형태 변경 동작 확인 (최소 ellipse, box 전환)
- [x] 설정 탭에서 3개 옵션 모두 정상 표시
- [x] 기존 설정이 없는 사용자도 기본값으로 정상 동작 (하위 호환)
