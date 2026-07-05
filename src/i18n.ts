// Lightweight i18n for user-facing strings.
// Currently supported: English (default / fallback), Korean, Japanese.
// New languages can be added by extending the `translations` table below.

type Locale = 'en' | 'ko' | 'ja';

const SUPPORTED_LOCALES: Locale[] = ['en', 'ko', 'ja'];

export type TranslationKey =
	| 'settingsLoadError'
	| 'headingGraph'
	| 'showArrowsName' | 'showArrowsDesc'
	| 'showBorderName' | 'showBorderDesc'
	| 'showOutgoingName' | 'showOutgoingDesc'
	| 'showIncomingName' | 'showIncomingDesc'
	| 'skipImagesName' | 'skipImagesDesc'
	| 'initialZoomName' | 'initialZoomDesc'
	| 'headingNodeStyle'
	| 'nodeShapeName' | 'nodeShapeDesc'
	| 'shapeEllipse' | 'shapeBox' | 'shapeCircle' | 'shapeDot' | 'shapeTextOnly'
	| 'nodeBgColorName' | 'nodeBgColorDesc'
	| 'nodeFontSizeName' | 'nodeFontSizeDesc'
	| 'truncateName' | 'truncateDesc'
	| 'maxLenName' | 'maxLenDesc'
	| 'maxLenCjkName' | 'maxLenCjkDesc'
	| 'toggleOutgoing' | 'toggleIncoming'
	| 'noNoteFound';

const translations: Record<Locale, Record<TranslationKey, string>> = {
	en: {
		settingsLoadError: 'Error: plugin settings could not be loaded. Please try reloading the plugin.',
		headingGraph: 'Graph',
		showArrowsName: 'Show arrows on edges',
		showArrowsDesc: 'Toggle arrow display on graph edges.',
		showBorderName: 'Show graph border',
		showBorderDesc: 'Toggle the border around the graph container.',
		showOutgoingName: 'Show outgoing links',
		showOutgoingDesc: 'Toggle whether to display outgoing links in the graph.',
		showIncomingName: 'Show incoming links',
		showIncomingDesc: 'Toggle whether to display backlinks in the graph.',
		skipImagesName: 'Skip image links',
		skipImagesDesc: 'Toggle whether to exclude image files from the graph.',
		initialZoomName: 'Initial zoom',
		initialZoomDesc: 'Set the initial zoom scale for the inline graph (default: 1.0).',
		headingNodeStyle: 'Node Style',
		nodeShapeName: 'Node shape',
		nodeShapeDesc: 'Set the shape of graph nodes.',
		shapeEllipse: 'Ellipse',
		shapeBox: 'Box',
		shapeCircle: 'Circle',
		shapeDot: 'Dot',
		shapeTextOnly: 'Text only',
		nodeBgColorName: 'Node background color',
		nodeBgColorDesc: 'Set the background color of graph nodes.',
		nodeFontSizeName: 'Node font size',
		nodeFontSizeDesc: 'Set the font size of node labels (default: 14).',
		truncateName: 'Truncate labels',
		truncateDesc: 'Shorten long node labels with ellipsis (...).',
		maxLenName: 'Max label length',
		maxLenDesc: 'Maximum characters before truncation for English labels (default: 20).',
		maxLenCjkName: 'Max label length (CJK)',
		maxLenCjkDesc: 'Maximum characters before truncation for CJK / full-width labels (default: 10).',
		toggleOutgoing: 'Outgoing',
		toggleIncoming: 'Incoming',
		noNoteFound: 'No note found.',
	},
	ko: {
		settingsLoadError: '오류: 플러그인 설정을 불러올 수 없습니다. 플러그인을 다시 로드해 주세요.',
		headingGraph: '그래프',
		showArrowsName: '엣지에 화살표 표시',
		showArrowsDesc: '그래프 엣지에 화살표를 표시합니다.',
		showBorderName: '그래프 테두리 표시',
		showBorderDesc: '그래프 컨테이너의 테두리 표시를 전환합니다.',
		showOutgoingName: '나가는 링크 표시',
		showOutgoingDesc: '그래프에 나가는 링크를 표시할지 전환합니다.',
		showIncomingName: '들어오는 링크 표시',
		showIncomingDesc: '그래프에 백링크(들어오는 링크)를 표시할지 전환합니다.',
		skipImagesName: '이미지 링크 제외',
		skipImagesDesc: '그래프에서 이미지 파일을 제외할지 전환합니다.',
		initialZoomName: '초기 확대/축소',
		initialZoomDesc: '인라인 그래프의 초기 확대/축소 배율을 설정합니다 (기본값: 1.0).',
		headingNodeStyle: '노드 스타일',
		nodeShapeName: '노드 모양',
		nodeShapeDesc: '그래프 노드의 모양을 설정합니다.',
		shapeEllipse: '타원',
		shapeBox: '박스',
		shapeCircle: '원',
		shapeDot: '점',
		shapeTextOnly: '텍스트만',
		nodeBgColorName: '노드 배경색',
		nodeBgColorDesc: '그래프 노드의 배경색을 설정합니다.',
		nodeFontSizeName: '노드 글꼴 크기',
		nodeFontSizeDesc: '노드 라벨의 글꼴 크기를 설정합니다 (기본값: 14).',
		truncateName: '라벨 줄임',
		truncateDesc: '긴 노드 라벨을 말줄임표(...)로 줄입니다.',
		maxLenName: '최대 라벨 길이',
		maxLenDesc: '영어 라벨을 줄이기 전 최대 글자 수 (기본값: 20).',
		maxLenCjkName: '최대 라벨 길이 (CJK)',
		maxLenCjkDesc: 'CJK/전각 라벨을 줄이기 전 최대 글자 수 (기본값: 10).',
		toggleOutgoing: '나가는 링크',
		toggleIncoming: '들어오는 링크',
		noNoteFound: '노트를 찾을 수 없습니다.',
	},
	ja: {
		settingsLoadError: 'エラー: プラグイン設定を読み込めませんでした。プラグインを再読み込みしてください。',
		headingGraph: 'グラフ',
		showArrowsName: '辺に矢印を表示',
		showArrowsDesc: 'グラフの辺に矢印を表示するかを切り替えます。',
		showBorderName: 'グラフの枠線を表示',
		showBorderDesc: 'グラフコンテナの枠線の表示を切り替えます。',
		showOutgoingName: '発リンクを表示',
		showOutgoingDesc: 'グラフに発リンク（アウトゴーイング）を表示するかを切り替えます。',
		showIncomingName: '被リンクを表示',
		showIncomingDesc: 'グラフに被リンク（バックリンク）を表示するかを切り替えます。',
		skipImagesName: '画像リンクを除外',
		skipImagesDesc: 'グラフから画像ファイルを除外するかを切り替えます。',
		initialZoomName: '初期ズーム',
		initialZoomDesc: 'インライングラフの初期ズーム倍率を設定します（既定: 1.0）。',
		headingNodeStyle: 'ノードスタイル',
		nodeShapeName: 'ノードの形状',
		nodeShapeDesc: 'グラフノードの形状を設定します。',
		shapeEllipse: '楕円',
		shapeBox: '四角',
		shapeCircle: '円',
		shapeDot: 'ドット',
		shapeTextOnly: 'テキストのみ',
		nodeBgColorName: 'ノードの背景色',
		nodeBgColorDesc: 'グラフノードの背景色を設定します。',
		nodeFontSizeName: 'ノードのフォントサイズ',
		nodeFontSizeDesc: 'ノードラベルのフォントサイズを設定します（既定: 14）。',
		truncateName: 'ラベルを省略',
		truncateDesc: '長いノードラベルを省略記号（...）で短縮します。',
		maxLenName: '最大ラベル長',
		maxLenDesc: '英語ラベルを省略するまでの最大文字数（既定: 20）。',
		maxLenCjkName: '最大ラベル長（CJK）',
		maxLenCjkDesc: 'CJK・全角ラベルを省略するまでの最大文字数（既定: 10）。',
		toggleOutgoing: '発リンク',
		toggleIncoming: '被リンク',
		noNoteFound: 'ノートが見つかりません。',
	},
};

// Obsidian stores the UI language in localStorage under the 'language' key.
// An empty/unset value means English.
function detectLocale(): Locale {
	const lang = window.localStorage.getItem('language') ?? '';
	return (SUPPORTED_LOCALES as string[]).includes(lang) ? (lang as Locale) : 'en';
}

const currentLocale: Locale = detectLocale();

// Returns the translation for the current locale, falling back to English.
export function t(key: TranslationKey): string {
	return translations[currentLocale][key] ?? translations.en[key];
}
