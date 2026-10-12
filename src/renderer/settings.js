// ============================================================================
// Lingual Desktop Settings — Pure pi-lingual Parity Controller
// - Enter-Driven Automatic Dispatch (Translate / Learn / Off)
// - Persistent UI Language Switcher (EN / ZH / TW / JA)
// - 3 Transparent Engine Modes:
//     1. Reuse Local Pi Model ($0 extra)
//     2. Free Web Translate (Google / MyMemory — $0, no key)
//     3. Free-Tier LLM (GLM-4-Flash ¥0 / SiliconFlow Qwen ¥0 / Groq Free) or Custom Key
// - Functional Natural Language Layout Tuner + Real-Time WYSIWYG Preview
// - Instant Auto-Save on Every Action
// ============================================================================

(function () {
  const UI_I18N = {
    en: {
      nav_general: "General",
      nav_cards: "Cards",
      nav_engine: "Engine",
      sec_mode_title: "Operating Mode",
      sec_mode_desc:
        "Type normally and press Enter in any input box. Lingual passively observes natural language without occupying or blocking any keyboard keys:",
      mode_en_title: "2 · Direct",
      mode_en_sub: "Fast 1-line translate & copy/replace",
      mode_orig_title: "1 · Learn",
      mode_orig_sub: "0ms raw send + full companion card",
      mode_sel_title: "3 · Candidates",
      mode_sel_sub: "Pick 1-3: Casual / Polite / Concise",
      mode_off_title: "0 · Off",
      mode_off_sub: "0 CPU hooks · Paused",
      sec_slang_title: "Source:",
      sec_slang_desc: "The primary language you type in:",
      sec_tlang_title: "Target:",
      sec_tlang_desc: "The target language to translate into:",
      sec_lang_pair_title: "Language Pair",
      sec_lang_pair_desc: "Source language you type in ➔ Target language to translate into:",
      sec_widget_title: "Top Floating Island",
      sec_widget_desc: "A minimal status island anchored at the top edge of your screen:",
      tog_widget_title: "Show Top Floating Island (⇄ EN)",
      tog_widget_desc: "Anchored at screen top edge. Click to cycle mode; drag to move anywhere.",
      preview_title: "Live Preview",
      preview_hint: 'Sample: "Can we release this feature tomorrow?"',
      free_engine_card_notice:
        "⚠️ <strong>Active Engine: Free Web Translate (Non-LLM)</strong> — Standard machine translation outputs <strong>1 direct translation line</strong> only (only the Source row toggle applies below). To enable Natural Language Layout Tuning, dual-register comparison, and vocabulary extraction, switch to <strong>1. Local Pi Model</strong> or <strong>3. Custom LLM API</strong> in the Engine tab.",
      ai_tuner_title: "Natural Language Layout Tuner (LLM Only)",
      ai_tuner_desc:
        "Rewrites the LLM system prompt to customize what rows appear on your card and their exact writing style (e.g. switching from Casual+Formal to Customer Support, X/Twitter hooks, or Single-Line Minimal):",
      ai_tuner_placeholder: "e.g. Single line only for fast chat, no source row or vocab...",
      ai_tuner_btn: "Apply",
      wish_1: "Single line (Minimal)",
      wish_2: "Casual + Formal",
      wish_3: "Customer Support",
      wish_4: "Social / X",
      wish_5: "Language Study",
      manual_toggle_title: "Visible Rows",
      tog_source_title: "Source text row",
      tog_source_desc: "Displays your initial input on top",
      tog_dual_title: "Dual tone comparison",
      tog_dual_desc: "Compares Casual spoken vs. Formal written",
      tog_meaning_title: "Nuance annotations",
      tog_meaning_desc: "Displays brief tone explanations below phrases",
      tog_vocab_title: "Vocabulary highlights",
      tog_vocab_desc: "Extracts key collocations and idioms at the bottom",
      adv_slots_summary: "Advanced slot configuration",
      btn_add_row: "+ Add Row",
      btn_reset_rows: "Reset Default",
      engine_choose_title: "Translation Engine & Trade-offs",
      engine_choose_desc: "Compare capabilities, accuracy, and token costs across the 3 engines:",
      emode_pi_title: "1. Reuse Local Pi Model (Zero Setup)",
      emode_pi_desc:
        "✔ Pros: Shares ~/.pi/agent/models.json automatically; full LLM accuracy, dual-tone comparison, vocab notes & layout tuning.<br>⚠️ Caveat: Consumes your Pi model's API quota. If your Pi session uses a high-cost flagship model (e.g. Claude Opus/Sonnet), frequent typing will incur token costs.",
      emode_free_title: "2. Free Web Translate (Google / MyMemory · No Key)",
      emode_free_desc:
        "✔ Pros: 100% free, zero API keys, zero token usage.<br>⚠️ Caveat: Traditional machine translation (non-LLM) — phrasing can be stiff/literal, and it CANNOT support layout tuning, dual-tone comparison, or vocabulary extraction (outputs 1 basic line only).",
      emode_custom_title: "3. Dedicated LLM API Key (GLM-4 / SiliconFlow / Groq / OpenAI)",
      emode_custom_desc:
        "✔ Pros: Completely isolated from your Pi quota. Using free-tier LLM keys (Zhipu GLM-4-Flash or SiliconFlow Qwen2.5-7B) gives you $0 cost AND full LLM layout tuning + dual-register comparison.<br>⚠️ Caveat: Requires pasting a free/custom API key once; lightweight free models are slightly less nuanced than flagship models on complex prose:",
      btn_show: "Show",
      btn_hide: "Hide",
      btn_test: "Test",
      adv_endpoint_summary: "Endpoint URL & Model ID",
      footer_hint: "Changes save automatically",
      footer_saved: "Saved · Active immediately",
      btn_logs: "View Logs",
      btn_close: "Cancel",
      btn_done: "Save",
      meta_orig: "Original input",
      meta_key: "Key {n}",
      meta_vocab: "Key terms",
    },
    zh: {
      nav_general: "常规",
      nav_cards: "卡片",
      nav_engine: "引擎",
      sec_mode_title: "运行模式（零键位占用 · 被动无感检测）",
      sec_mode_desc:
        "不占用、不拦截任何系统快捷键。日常打字按回车 (Enter) 100% 原生零延迟直通，后台被动检测自然语言并展开对照卡片：",
      mode_en_title: "2 · 直出 (Direct)",
      mode_en_sub: "专属极速 1 行直译复制/原地替换",
      mode_orig_title: "1 · 伴学 (Learn)",
      mode_orig_sub: "0ms 原话直发 + 全营养双语词卡",
      mode_sel_title: "3 · 候选 (Pick 3)",
      mode_sel_sub: "按 1-3 秒选：随和 / 礼貌 / 精炼",
      mode_off_title: "0 · 关闭 (Off)",
      mode_off_sub: "进程级停监听 · 0 CPU 零负担",
      sec_slang_title: "源语言:",
      sec_slang_desc: "你日常打字输入的母语：",
      sec_tlang_title: "目标语言:",
      sec_tlang_desc: "希望转换成的目标外语：",
      sec_lang_pair_title: "语言对设置",
      sec_lang_pair_desc: "输入母语 ➔ 目标外语：",
      sec_widget_title: "屏幕顶端悬浮岛",
      sec_widget_desc: "常驻屏幕最顶部中央的极简状态胶囊，实时显示模式状态并支持拖拽位置：",
      tog_widget_title: "显示屏幕顶端悬浮岛 (⇄ EN)",
      tog_widget_desc: "常驻屏幕顶端，点击切换模式，支持鼠标按住拖拽至屏幕任意位置。",
      preview_title: "实时预览",
      preview_hint: "示例：「这个功能明天能上线吗？」",
      free_engine_card_notice:
        "⚠️ <strong>当前引擎为「公共网页基础翻译（传统机翻）」</strong>：传统机器翻译非大模型，仅能固定输出 <strong>1 行基础译文</strong>（下方仅「原文行」开关生效）。若需使用「一句话定制版式」、口语/书面双语气对照及重点词汇提取，请在「引擎」页切换为 <strong>1. 复用本地 Pi 模型</strong> 或 <strong>3. 独立大模型 API</strong>。",
      ai_tuner_title: "一句话定制版式（仅大模型引擎生效）",
      ai_tuner_desc:
        "作用：动态改写大模型的系统提示词（System Prompt），把默认卡片改成你需要的专属行项与文风（例如改为「跨境客服礼貌回复 + 催单」、「推特短句」或「极简一行译文」）：",
      ai_tuner_placeholder: "例如：只要一行极简译文，不显示原文和词汇...",
      ai_tuner_btn: "应用",
      wish_1: "单行极简（纯打字）",
      wish_2: "口语 + 书面双轨",
      wish_3: "商务与客服回复",
      wish_4: "社媒与推特短句",
      wish_5: "外语伴学（含词汇）",
      manual_toggle_title: "显示行项",
      tog_source_title: "原文行 (Source)",
      tog_source_desc: "首行显示你输入的原话",
      tog_dual_title: "双语气对照 (Casual / Formal)",
      tog_dual_desc: "同时展示日常口语与正式书面语",
      tog_meaning_title: "语境微释义 (Nuance)",
      tog_meaning_desc: "在译文下方附简短语气说明",
      tog_vocab_title: "重点词汇 (Vocab)",
      tog_vocab_desc: "底部提取实用短语与搭配",
      adv_slots_summary: "高级行项配置",
      btn_add_row: "+ 新增行",
      btn_reset_rows: "重置默认",
      engine_choose_title: "翻译驱动引擎（含各方案优缺点对比）",
      engine_choose_desc: "请根据你对翻译准确度、版式定制与 Token 成本的偏好选择：",
      emode_pi_title: "1. 复用本地 Pi Agent 模型（免配 Key · 共享 Pi 额度）",
      emode_pi_desc:
        "✔ <strong>优势</strong>：自动复用 <code>~/.pi/agent/models.json</code> 模型通道，免填 Key，完整支持「一句话定制版式」、口语/书面双语气对照与词汇提取，准确度最高。<br>⚠️ <strong>缺点/注意</strong>：<strong>直接消耗你 Pi 配置的模型额度</strong>。若你的 Pi 绑定的是昂贵的旗舰付费模型（如 Claude Opus/Sonnet），日常高频打字会产生额外的 Token 账单消耗。",
      emode_free_title: "2. 公共网页基础翻译（Google / MyMemory · 免 Key 传统机翻）",
      emode_free_desc:
        "✔ <strong>优势</strong>：免注册免 Key，完全不消耗任何大模型 Token。<br>⚠️ <strong>缺点/注意</strong>：属于<strong>传统机器直译（非大模型），准确度与地道感一般，长句容易生硬直译</strong>；且<strong>无法使用「一句话定制版式」、无双语气对照、无词汇提取</strong>（每次仅固定输出 1 行基础译文）。",
      emode_custom_title: "3. 独立大模型 API 密钥（推荐配免费层 · 与 Pi 额度隔离）",
      emode_custom_desc:
        "✔ <strong>优势</strong>：<strong>与你的 Pi 主力编程额度彻底隔离，互不抢占</strong>。填入智谱 <code>GLM-4-Flash</code> 或硅基流动 <code>Qwen2.5-7B</code> 的官方免费 API Key，即可在 <strong>0 成本</strong> 下完整享受「一句话定制版式」与双语气伴学。<br>⚠️ <strong>缺点/注意</strong>：首次需去对应平台复制粘贴一次 API Key；免费层小模型在极长复杂句上的文采略逊于顶级旗舰大模型：",
      btn_show: "显示",
      btn_hide: "隐藏",
      btn_test: "测试",
      adv_endpoint_summary: "Endpoint URL & Model ID",
      footer_hint: "所有改动自动保存并即时生效",
      footer_saved: "已保存 · 即时生效",
      btn_logs: "查看日志",
      btn_close: "取消",
      btn_done: "确定",
      meta_orig: "输入原文",
      meta_key: "按 {n} 选择",
      meta_vocab: "重点短语",
    },
    "zh-TW": {
      nav_general: "常規",
      nav_cards: "卡片",
      nav_engine: "引擎",
      sec_mode_title: "運行模式（零鍵位佔用 · 被動無感檢測）",
      sec_mode_desc:
        "不佔用、不攔截任何系統快捷鍵。日常打字按 Enter 100% 原生零延遲直通，後台被動檢測自然語言並展開對照卡片：",
      mode_en_title: "2 · 直出 (Direct)",
      mode_en_sub: "專屬極速 1 行直譯複製/原地替換",
      mode_orig_title: "1 · 伴學 (Learn)",
      mode_orig_sub: "0ms 原話直發 + 全營養雙語詞卡",
      mode_sel_title: "3 · 候選 (Pick 3)",
      mode_sel_sub: "按 1-3 秒選：隨和 / 禮貌 / 精煉",
      mode_off_title: "0 · 關閉 (Off)",
      mode_off_sub: "進程級停監聽 · 0 CPU 零負擔",
      sec_slang_title: "源語言:",
      sec_slang_desc: "你日常打字輸入的母語：",
      sec_tlang_title: "目標語言:",
      sec_tlang_desc: "希望轉換成的目標外語：",
      sec_lang_pair_title: "語言對設置",
      sec_lang_pair_desc: "輸入母語 ➔ 目標外語：",
      sec_widget_title: "螢幕頂端懸浮島",
      sec_widget_desc: "常駐螢幕頂部的極簡狀態膠囊，即時顯示模式狀態並支援拖拽位置：",
      tog_widget_title: "顯示螢幕頂端懸浮島 (⇄ EN)",
      tog_widget_desc: "常駐螢幕頂端，點擊切換模式，支援滑鼠按住拖拽至螢幕任意位置。",
      preview_title: "即時預覽",
      preview_hint: "示例：「這個功能明天能上線嗎？」",
      ai_tuner_title: "一句話定制版式",
      ai_tuner_desc: "輸入你的日常用途或點選下方預設：",
      ai_tuner_placeholder: "例如：只要一行極簡譯文，不顯示原文和詞彙...",
      ai_tuner_btn: "應用",
      wish_1: "單行極簡（純打字）",
      wish_2: "口語 + 書面雙軌",
      wish_3: "商務與客服回覆",
      wish_4: "社媒與推特短句",
      wish_5: "外語伴學（含詞彙）",
      manual_toggle_title: "顯示行項",
      tog_source_title: "原文行 (Source)",
      tog_source_desc: "首行顯示你輸入的原話",
      tog_dual_title: "雙語氣對照 (Casual / Formal)",
      tog_dual_desc: "同時展示日常口語與正式書面語",
      tog_meaning_title: "語境微釋義 (Nuance)",
      tog_meaning_desc: "在譯文下方附簡短語氣說明",
      tog_vocab_title: "重點詞彙 (Vocab)",
      tog_vocab_desc: "底部提取實用短語與搭配",
      adv_slots_summary: "高級行項配置",
      btn_add_row: "+ 新增行",
      btn_reset_rows: "重置默認",
      engine_choose_title: "翻譯驅動引擎 (支援 3 種透明配置方案)",
      engine_choose_desc: "根據你的使用習慣選擇翻譯來源：",
      emode_pi_title: "1. 複用本地 Pi Agent 模型 (推薦 · 零額外配置)",
      emode_pi_desc:
        "自動讀取複用你電腦上 ~/.pi/agent/models.json 已配好的模型通道，無需重複填 Key。",
      emode_free_title: "2. 公共網頁基礎翻譯 (免註冊 / 免 API 密鑰)",
      emode_free_desc:
        "直接調用公共網頁翻譯接口（Google + MyMemory），無需註冊帳號。注：屬於傳統機器翻譯，每次僅輸出 1 行標準譯文。",
      emode_custom_title: "3. 自定義大模型 API 密鑰 (智譜 / 矽基 / Groq / OpenAI 等)",
      emode_custom_desc:
        "支援任意相容 OpenAI 格式的模型接口，填入對應 API Key 即可享受完整雙語氣能力：",
      btn_show: "顯示",
      btn_hide: "隱藏",
      btn_test: "測試",
      adv_endpoint_summary: "Endpoint URL & Model ID",
      footer_hint: "所有改動自動保存並即時生效",
      footer_saved: "已保存 · 即時生效",
      btn_logs: "查看日誌",
      btn_close: "取消",
      btn_done: "確定",
      meta_orig: "輸入原文",
      meta_key: "按 {n} 選擇",
      meta_vocab: "重點短語",
    },
    ja: {
      nav_general: "一般",
      nav_cards: "カード",
      nav_engine: "エンジン",
      sec_mode_title: "動作モード（キー占有ゼロ · パッシブ検知）",
      sec_mode_desc:
        "ショートカットキーを一切占有せず、Enter も遅延ゼロでそのまま通過します。バックグラウンドで自然言語を検知してカードを表示：",
      mode_en_title: "2 · 直訳 (Direct)",
      mode_en_sub: "高速1行翻訳＆コピー/そのまま置換",
      mode_orig_title: "1 · 学習 (Learn)",
      mode_orig_sub: "0ms原文送信＋双方向学習カード",
      mode_sel_title: "3 · 候補 (Pick 3)",
      mode_sel_sub: "1-3で即選択：口語 / 丁寧 / 簡潔",
      mode_off_title: "0 · オフ (Off)",
      mode_off_sub: "監視プロセス停止 · 0 CPU 負荷",
      sec_slang_title: "入力言語:",
      sec_slang_desc: "普段入力する言語：",
      sec_tlang_title: "翻訳先言語:",
      sec_tlang_desc: "翻訳先の言語：",
      sec_lang_pair_title: "言語ペア設定",
      sec_lang_pair_desc: "入力言語 ➔ 翻訳先言語：",
      sec_widget_title: "画面上部フローティングアイランド",
      sec_widget_desc: "画面上部に常駐するミニマルなカプセルで、動作状態を一目で確認：",
      tog_widget_title: "画面上部フローティングアイランドを表示 (⇄ EN)",
      tog_widget_desc: "画面最上部に常駐。クリックでモード切替、ドラッグで自由移動。",
      preview_title: "プレビュー",
      preview_hint: "例：「この機能、明日リリースできる？」",
      ai_tuner_title: "自然言語プリセット",
      ai_tuner_desc: "用途を入力するか下のプリセットを選択：",
      ai_tuner_placeholder: "例：シンプルな翻訳1行のみ、原文と単語は非表示...",
      ai_tuner_btn: "適用",
      wish_1: "1行ミニマル（入力のみ）",
      wish_2: "口語 + フォーマル比較",
      wish_3: "ビジネス・サポート対応",
      wish_4: "SNS / X ショート文",
      wish_5: "語学学習（単語付き）",
      manual_toggle_title: "表示項目",
      tog_source_title: "原文行 (Source)",
      tog_source_desc: "先頭行に入力した原文を表示",
      tog_dual_title: "2トーン比較 (Casual / Formal)",
      tog_dual_desc: "カジュアル口語とフォーマル文面を併記",
      tog_meaning_title: "ニュアンス注釈 (Nuance)",
      tog_meaning_desc: "各翻訳の下にトーン解説を表示",
      tog_vocab_title: "重要表現 (Vocab)",
      tog_vocab_desc: "下部に有用な連語・イディオムを抽出",
      adv_slots_summary: "詳細スロット設定",
      btn_add_row: "+ 行を追加",
      btn_reset_rows: "リセット",
      engine_choose_title: "翻訳エンジン（3つの方式から選択）",
      engine_choose_desc: "翻訳エンジンの駆動方式を選択：",
      emode_pi_title: "1. ローカル Pi モデルを共有（推奨 · 追加費用 $0）",
      emode_pi_desc:
        "~/.pi/agent/models.json に設定済みのモデルを自動共有します。追加設定なしで2トーン比較・語彙解説を利用可能。",
      emode_free_title: "2. 無料 Web 翻訳 (Google / MyMemory · キー不要)",
      emode_free_desc:
        "登録やAPIキー不要の公開Web翻訳API（Google + MyMemory）を使用します（標準翻訳1行のみ出力）。",
      emode_custom_title: "3. カスタム LLM API Key (OpenAI / Groq 等)",
      emode_custom_desc:
        "標準的な OpenAI 互換エンドポイントをサポート。API Key を入力して利用：",
      btn_show: "表示",
      btn_hide: "隠す",
      btn_test: "テスト",
      adv_endpoint_summary: "Endpoint URL & Model ID",
      footer_hint: "変更は自動的に保存・反映されます",
      footer_saved: "保存済み · 即時反映",
      btn_logs: "ログを表示",
      btn_close: "キャンセル",
      btn_done: "確定",
      meta_orig: "入力原文",
      meta_key: "{n} キーで選択",
      meta_vocab: "重要語彙",
    },
    ko: {
      nav_general: "일반",
      nav_cards: "카드",
      nav_engine: "엔진",
      sec_mode_title: "동작 모드 (키 점유 제로 · 패시브 감지)",
      sec_mode_desc: "단축키를 전혀 가로채지 않으며 Enter 키 지연 없이 그대로 전달됩니다. 백그라운드에서 자연어를 감지하여 카드를 표시합니다.",
      mode_en_title: "2 · 직출 (Direct)",
      mode_en_sub: "초고속 1줄 번역 및 복사/즉시 대체",
      mode_orig_title: "1 · 학습 (Learn)",
      mode_orig_sub: "0ms 원문 전송 + 이중언어 학습 카드",
      mode_sel_title: "3 · 후보 (Pick 3)",
      mode_sel_sub: "1-3 즉시 선택: 친근 / 정중 / 간결",
      mode_off_title: "0 · 끄기 (Off)",
      mode_off_sub: "감시 프로세스 중지 · 0 CPU",
      sec_slang_title: "입력 언어:",
      sec_slang_desc: "평소 입력하는 모국어:",
      sec_tlang_title: "번역 언어:",
      sec_tlang_desc: "번역할 목표 언어:",
      sec_lang_pair_title: "언어 쌍 설정",
      sec_lang_pair_desc: "입력 언어 ➔ 번역 목표 언어:",
      sec_widget_title: "상단 플로팅 아일랜드",
      sec_widget_desc: "화면 최상단에 상주하는 미니멀 상태 캡슐:",
      tog_widget_title: "화면 상단 플로팅 아일랜드 표시 (⇄ EN)",
      tog_widget_desc: "화면 최상단 상주. 클릭하여 모드 전환, 드래그하여 자유 이동.",
      preview_title: "실시간 미리보기",
      preview_hint: '예: "이 기능 내일 배포할 수 있을까요?"',
      ai_tuner_title: "자연어 레이아웃 튜너",
      ai_tuner_desc: "원하는 레이아웃을 입력하거나 아래 프리셋을 클릭하세요:",
      ai_tuner_placeholder: "예: 원문 없이 한 줄 요약만 간결하게...",
      ai_tuner_btn: "적용",
      wish_1: "한 줄 미니멀 (타이핑 전용)",
      wish_2: "구어체 + 문어체 비교",
      wish_3: "비즈니스 및 고객 지원",
      wish_4: "소셜 미디어 / X 단문",
      wish_5: "어학 학습 (어휘 포함)",
      manual_toggle_title: "표시 항목",
      tog_source_title: "원문 행 (Source)",
      tog_source_desc: "첫 행에 입력한 원문 표시",
      tog_dual_title: "2톤 뉘앙스 비교 (Casual / Formal)",
      tog_dual_desc: "일상 구어체와 격식체 문어체 병기",
      tog_meaning_title: "뉘앙스 해설 (Nuance)",
      tog_meaning_desc: "번역 아래에 뉘앙스 및 어조 설명",
      tog_vocab_title: "핵심 어휘 (Vocab)",
      tog_vocab_desc: "하단에 유용한 관용구 및 어휘 추출",
      adv_slots_summary: "고급 슬롯 설정",
      btn_add_row: "+ 행 추가",
      btn_reset_rows: "초기화",
      engine_choose_title: "번역 엔진 옵션",
      engine_choose_desc: "번역을 구동할 방식을 선택하세요:",
      emode_pi_title: "1. 로컬 Pi 모델 공유 (권장 · 추가비용 $0)",
      emode_pi_desc: "자동으로 ~/.pi/agent/models.json 에 설정된 모델을 공유합니다.",
      emode_free_title: "2. 무료 웹 번역 (Google / MyMemory · 키 불필요)",
      emode_free_desc: "공개 웹 번역 API를 사용합니다 (표준 번역 1행 출력).",
      emode_custom_title: "3. 커스텀 LLM API 키 (OpenAI / Groq 등)",
      emode_custom_desc: "OpenAI 호환 엔드포인트를 직접 연결합니다:",
      btn_show: "표시",
      btn_hide: "숨김",
      btn_test: "테스트",
      adv_endpoint_summary: "Endpoint URL & Model ID",
      footer_hint: "변경 사항은 자동으로 저장됩니다",
      footer_saved: "저장 완료 · 즉시 적용",
      btn_logs: "로그 보기",
      btn_close: "취소",
      btn_done: "확인",
      meta_orig: "입력 원문",
      meta_key: "{n}번 선택",
      meta_vocab: "핵심 어휘",
    },
    es: {
      nav_general: "General",
      nav_cards: "Tarjetas",
      nav_engine: "Motor",
      sec_mode_title: "Modo de funcionamiento",
      sec_mode_desc: "Observa pasivamente tus entradas sin ocupar ni bloquear teclas. Latencia de Enter a 0 ms.",
      mode_en_title: "2 · Directo",
      mode_en_sub: "Traducción rápida de 1 línea y reemplazo",
      mode_orig_title: "1 · Aprender",
      mode_orig_sub: "Envío 0ms + tarjeta bilingüe",
      mode_sel_title: "3 · Opciones",
      mode_sel_sub: "Elige 1-3: Coloquial / Cortés / Conciso",
      mode_off_title: "0 · Apagado",
      mode_off_sub: "0 hooks de CPU · En pausa",
      sec_slang_title: "Idioma origen:",
      sec_slang_desc: "El idioma en el que escribes:",
      sec_tlang_title: "Idioma destino:",
      sec_tlang_desc: "El idioma al que deseas traducir:",
      sec_lang_pair_title: "Par de idiomas",
      sec_lang_pair_desc: "Idioma de entrada ➔ Idioma de destino:",
      sec_widget_title: "Isla flotante superior",
      sec_widget_desc: "Cápsula mínima anclada en el borde superior de la pantalla:",
      tog_widget_title: "Mostrar isla flotante superior (⇄ EN)",
      tog_widget_desc: "Anclada en la parte superior. Clic para cambiar modo; arrastra para mover.",
      preview_title: "Vista previa en vivo",
      preview_hint: 'Ejemplo: "¿Podemos lanzar esta función mañana?"',
      ai_tuner_title: "Ajuste de diseño en lenguaje natural",
      ai_tuner_desc: "Escribe una instrucción personalizada o pulsa un ajuste:",
      ai_tuner_placeholder: "ej. Una sola línea sin texto original...",
      ai_tuner_btn: "Aplicar",
      wish_1: "Una línea mínima",
      wish_2: "Coloquial + Formal",
      wish_3: "Atención al cliente",
      wish_4: "Redes sociales / X",
      wish_5: "Estudio de idiomas",
      manual_toggle_title: "Filas visibles",
      tog_source_title: "Fila de texto original",
      tog_source_desc: "Muestra la frase inicial en la parte superior",
      tog_dual_title: "Comparación de dos tonos",
      tog_dual_desc: "Compara el estilo coloquial con el formal",
      tog_meaning_title: "Anotaciones de matiz",
      tog_meaning_desc: "Muestra explicaciones breves de tono debajo",
      tog_vocab_title: "Vocabulario destacado",
      tog_vocab_desc: "Extrae giros y expresiones clave abajo",
      adv_slots_summary: "Configuración avanzada de ranuras",
      btn_add_row: "+ Añadir fila",
      btn_reset_rows: "Restablecer",
      engine_choose_title: "Opciones del motor de traducción",
      engine_choose_desc: "Selecciona cómo se impulsan las traducciones:",
      emode_pi_title: "1. Reutilizar modelo local de Pi (Recomendado · $0)",
      emode_pi_desc: "Comparte automáticamente el modelo configurado en ~/.pi/agent/models.json.",
      emode_free_title: "2. Traducción web gratuita (Google / MyMemory · Sin clave)",
      emode_free_desc: "APIs públicas sin registro ni claves (1 línea de traducción estándar).",
      emode_custom_title: "3. Clave API de LLM personalizada (OpenAI / Groq)",
      emode_custom_desc: "Conéctate a cualquier punto de conexión compatible con OpenAI:",
      btn_show: "Mostrar",
      btn_hide: "Ocultar",
      btn_test: "Probar",
      adv_endpoint_summary: "Endpoint URL & Model ID",
      footer_hint: "Los cambios se guardan automáticamente",
      footer_saved: "Guardado · Activo de inmediato",
      btn_logs: "Ver registros",
      btn_close: "Cancelar",
      btn_done: "Aceptar",
      meta_orig: "Texto original",
      meta_key: "Tecla {n}",
      meta_vocab: "Términos clave",
    },
    fr: {
      nav_general: "Général",
      nav_cards: "Cartes",
      nav_engine: "Moteur",
      sec_mode_title: "Mode de fonctionnement",
      sec_mode_desc: "Observe passivement les saisies sans bloquer de raccourcis clavier. Latence de la touche Entrée à 0 ms.",
      mode_en_title: "2 · Direct",
      mode_en_sub: "Traduction rapide 1 ligne et remplacement",
      mode_orig_title: "1 · Apprendre",
      mode_orig_sub: "Envoi 0ms + carte bilingue",
      mode_sel_title: "3 · Options",
      mode_sel_sub: "Touches 1-3 : Familier / Poli / Concis",
      mode_off_title: "0 · Désactivé",
      mode_off_sub: "0 hook CPU · En veille",
      sec_slang_title: "Langue source :",
      sec_slang_desc: "La langue dans laquelle vous écrivez :",
      sec_tlang_title: "Langue cible :",
      sec_tlang_desc: "La langue vers laquelle traduire :",
      sec_lang_pair_title: "Paire de langues",
      sec_lang_pair_desc: "Langue de saisie ➔ Langue cible :",
      sec_widget_title: "Îlot flottant supérieur",
      sec_widget_desc: "Capsule minimale ancrée en haut de l'écran :",
      tog_widget_title: "Afficher l'îlot flottant supérieur (⇄ EN)",
      tog_widget_desc: "Ancré en haut de l'écran. Clic pour changer de mode ; glisser pour déplacer.",
      preview_title: "Aperçu en direct",
      preview_hint: 'Exemple : "On peut lancer cette fonctionnalité demain ?"',
      ai_tuner_title: "Personnalisation en langage naturel",
      ai_tuner_desc: "Saisissez une consigne ou choisissez un préréglage :",
      ai_tuner_placeholder: "ex. Une seule ligne sans texte source...",
      ai_tuner_btn: "Appliquer",
      wish_1: "Une seule ligne minimale",
      wish_2: "Oral + Écrit formel",
      wish_3: "Support client",
      wish_4: "Réseaux sociaux / X",
      wish_5: "Apprentissage des langues",
      manual_toggle_title: "Lignes visibles",
      tog_source_title: "Ligne de texte source",
      tog_source_desc: "Affiche votre saisie initiale en haut",
      tog_dual_title: "Comparaison des deux registres",
      tog_dual_desc: "Compare l'oral familier et l'écrit soutenu",
      tog_meaning_title: "Annotations de nuance",
      tog_meaning_desc: "Affiche des explications de ton sous les phrases",
      tog_vocab_title: "Vocabulaire clé",
      tog_vocab_desc: "Extrait les expressions idiomatiques en bas",
      adv_slots_summary: "Configuration avancée des emplacements",
      btn_add_row: "+ Ajouter une ligne",
      btn_reset_rows: "Réinitialiser",
      engine_choose_title: "Options du moteur de traduction",
      engine_choose_desc: "Sélectionnez le moteur de traduction :",
      emode_pi_title: "1. Réutiliser le modèle local Pi (Recommandé · 0 $)",
      emode_pi_desc: "Partage automatiquement le modèle de ~/.pi/agent/models.json.",
      emode_free_title: "2. Traduction Web gratuite (Google / MyMemory · Sans clé)",
      emode_free_desc: "APIs publiques sans inscription (1 ligne de traduction standard).",
      emode_custom_title: "3. Clé API LLM personnalisée (OpenAI / Groq)",
      emode_custom_desc: "Connectez-vous à n'importe quel point de terminaison compatible OpenAI :",
      btn_show: "Afficher",
      btn_hide: "Masquer",
      btn_test: "Tester",
      adv_endpoint_summary: "Endpoint URL & Model ID",
      footer_hint: "Enregistrement automatique",
      footer_saved: "Enregistré · Immédiatement actif",
      btn_logs: "Voir les logs",
      btn_close: "Annuler",
      btn_done: "Valider",
      meta_orig: "Texte original",
      meta_key: "Touche {n}",
      meta_vocab: "Mots clés",
    },
    de: {
      nav_general: "Allgemein",
      nav_cards: "Karten",
      nav_engine: "Engine",
      sec_mode_title: "Betriebsmodus",
      sec_mode_desc: "Erfasst Eingaben passiv ohne Tastaturbeschränkung. Eingabetaste hat 0 ms Latenz.",
      mode_en_title: "2 · Direkt",
      mode_en_sub: "Schnelle 1-Zeilen-Übersetzung & Ersetzen",
      mode_orig_title: "1 · Lernen",
      mode_orig_sub: "0ms Senden + zweisprachige Karte",
      mode_sel_title: "3 · Auswahl",
      mode_sel_sub: "Tasten 1-3: Locker / Höflich / Prägnant",
      mode_off_title: "0 · Aus",
      mode_off_sub: "0 CPU-Hooks · Pausiert",
      sec_slang_title: "Ausgangssprache:",
      sec_slang_desc: "Die Sprache, in der Sie schreiben:",
      sec_tlang_title: "Zielsprache:",
      sec_tlang_desc: "Die Zielsprache für die Übersetzung:",
      sec_lang_pair_title: "Sprachpaar",
      sec_lang_pair_desc: "Eingabesprache ➔ Zielsprache:",
      sec_widget_title: "Obere schwebende Insel",
      sec_widget_desc: "Minimale Statuskapsel am oberen Bildschirmrand:",
      tog_widget_title: "Obere schwebende Insel anzeigen (⇄ EN)",
      tog_widget_desc: "Am oberen Bildschirmrand verankert. Klicken zum Umschalten; Ziehen zum Bewegen.",
      preview_title: "Live-Vorschau",
      preview_hint: 'Beispiel: "Können wir das Feature morgen live schalten?"',
      ai_tuner_title: "Layout-Anpassung in natürlicher Sprache",
      ai_tuner_desc: "Geben Sie eine Anweisung ein oder wählen Sie eine Vorlage:",
      ai_tuner_placeholder: "z.B. Nur eine Zeile ohne Quelltext...",
      ai_tuner_btn: "Anwenden",
      wish_1: "Einzeilig minimal",
      wish_2: "Umgangssprachlich + Formell",
      wish_3: "Kundenservice",
      wish_4: "Social Media / X",
      wish_5: "Sprachlernen",
      manual_toggle_title: "Sichtbare Zeilen",
      tog_source_title: "Quelltextzeile",
      tog_source_desc: "Zeigt Ihre ursprüngliche Eingabe oben an",
      tog_dual_title: "Zwei-Ton-Vergleich",
      tog_dual_desc: "Vergleicht Umgangssprache mit formeller Schrift",
      tog_meaning_title: "Nuancen-Erklärungen",
      tog_meaning_desc: "Zeigt kurze Ton-Erklärungen darunter an",
      tog_vocab_title: "Schlüsselwörter",
      tog_vocab_desc: "Hebt Redewendungen und Ausdrücke unten hervor",
      adv_slots_summary: "Erweiterte Slot-Einstellungen",
      btn_add_row: "+ Zeile hinzufügen",
      btn_reset_rows: "Zurücksetzen",
      engine_choose_title: "Optionen der Übersetzungs-Engine",
      engine_choose_desc: "Wählen Sie, wie Übersetzungen betrieben werden:",
      emode_pi_title: "1. Lokales Pi-Modell teilen (Empfohlen · 0 $)",
      emode_pi_desc: "Nutzt automatisch das in ~/.pi/agent/models.json konfigurierte Modell.",
      emode_free_title: "2. Kostenlose Web-Übersetzung (Google / MyMemory · Kein Key)",
      emode_free_desc: "Öffentliche Web-APIs ohne Registrierung (1 Standard-Übersetzungszeile).",
      emode_custom_title: "3. Benutzerdefinierter LLM-API-Schlüssel (OpenAI / Groq)",
      emode_custom_desc: "Verbindet sich mit jedem OpenAI-kompatiblen Endpunkt:",
      btn_show: "Anzeigen",
      btn_hide: "Ausblenden",
      btn_test: "Testen",
      adv_endpoint_summary: "Endpoint URL & Model ID",
      footer_hint: "Änderungen werden automatisch gespeichert",
      footer_saved: "Gespeichert · Sofort aktiv",
      btn_logs: "Logs anzeigen",
      btn_close: "Abbrechen",
      btn_done: "Übernehmen",
      meta_orig: "Originaltext",
      meta_key: "Taste {n}",
      meta_vocab: "Schlüsselwörter",
    },
    ru: {
      nav_general: "Общие",
      nav_cards: "Карточки",
      nav_engine: "Движок",
      sec_mode_title: "Режим работы",
      sec_mode_desc: "Пассивно отслеживает ввод текста без перехвата клавиш. Нулевая задержка Enter.",
      mode_en_title: "2 · Прямой",
      mode_en_sub: "Быстрый перевод в 1 строку и замена",
      mode_orig_title: "1 · Обучение",
      mode_orig_sub: "Отправка 0мс + карточка обучения",
      mode_sel_title: "3 · Варианты",
      mode_sel_sub: "Клавиши 1-3: Живой / Вежливый / Краткий",
      mode_off_title: "0 · Выкл",
      mode_off_sub: "0 хуков CPU · На паузе",
      sec_slang_title: "Исходный язык:",
      sec_slang_desc: "Язык, на котором вы печатаете:",
      sec_tlang_title: "Целевой язык:",
      sec_tlang_desc: "Язык, на который переводить:",
      sec_lang_pair_title: "Языковая пара",
      sec_lang_pair_desc: "Язык ввода ➔ Язык перевода:",
      sec_widget_title: "Верхний плавающий остров",
      sec_widget_desc: "Компактная капсула в верхней части экрана:",
      tog_widget_title: "Показывать плавающий остров (⇄ EN)",
      tog_widget_desc: "Закреплен вверху экрана. Клик для смены режима, перетаскивание мышью.",
      preview_title: "Предпросмотр",
      preview_hint: 'Пример: "Сможем выкатить эту фичу завтра?"',
      ai_tuner_title: "Настройка на естественном языке",
      ai_tuner_desc: "Введите инструкцию или выберите готовый шаблон:",
      ai_tuner_placeholder: "например, Только одна строка перевода без оригинала...",
      ai_tuner_btn: "Применить",
      wish_1: "Однострочный минимал",
      wish_2: "Разговорный + Деловой",
      wish_3: "Клиентская поддержка",
      wish_4: "Соцсети / X",
      wish_5: "Изучение языка",
      manual_toggle_title: "Отображаемые строки",
      tog_source_title: "Строка оригинала",
      tog_source_desc: "Отображает исходный текст сверху",
      tog_dual_title: "Два регистра общения",
      tog_dual_desc: "Сравнивает разговорный стиль с деловым",
      tog_meaning_title: "Пояснения нюансов",
      tog_meaning_desc: "Краткие объяснения оттенков смысла под текстом",
      tog_vocab_title: "Ключевая лексика",
      tog_vocab_desc: "Полезные выражения и идиомы внизу",
      adv_slots_summary: "Расширенная настройка слотов",
      btn_add_row: "+ Добавить строку",
      btn_reset_rows: "Сбросить",
      engine_choose_title: "Варианты движка перевода",
      engine_choose_desc: "Выберите источник перевода:",
      emode_pi_title: "1. Использовать локальную модель Pi (Рекомендуется · 0 $)",
      emode_pi_desc: "Автоматически использует модель из ~/.pi/agent/models.json.",
      emode_free_title: "2. Бесплатный веб-перевод (Google / MyMemory · Без ключа)",
      emode_free_desc: "Публичные API без регистрации и ключей (1 стандартная строка).",
      emode_custom_title: "3. Пользовательский ключ API LLM (OpenAI / Groq)",
      emode_custom_desc: "Подключение к любому OpenAI-совместимому эндпоинту:",
      btn_show: "Показать",
      btn_hide: "Скрыть",
      btn_test: "Тест",
      adv_endpoint_summary: "Endpoint URL & Model ID",
      footer_hint: "Изменения сохраняются автоматически",
      footer_saved: "Сохранено · Активно",
      btn_logs: "Открыть логи",
      btn_close: "Отмена",
      btn_done: "Сохранить",
      meta_orig: "Оригинал",
      meta_key: "Клавиша {n}",
      meta_vocab: "Ключевые слова",
    },
  };

  let activeUiLang = "zh";
  let activeSourceLang = "zh";
  let activeTargetLang = "en";
  let activeCompanionMode = "english";
  let activeEngineMode = "pi";
  let activeSlotPreset = "developer";
  let currentSlots = [];
  let isInitialLoading = true;

  function t(key) {
    const dict = UI_I18N[activeUiLang] || UI_I18N.en;
    return dict[key] || UI_I18N.en[key] || key;
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function applyInterfaceLanguage(langCode) {
    activeUiLang = UI_I18N[langCode] ? langCode : "en";
    const dict = UI_I18N[activeUiLang] || UI_I18N.en;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (key && dict[key]) {
        el.innerHTML = dict[key];
      }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      if (key && dict[key]) {
        el.setAttribute("placeholder", dict[key]);
      }
    });
  }

  // 1. Top Pill Tabs & Language Switcher
  const navPills = document.querySelectorAll(".nav-pill");
  const tabPanes = document.querySelectorAll(".tab-pane");
  const btnLangTrigger = document.getElementById("btn-lang-trigger");
  const langCurrentCode = document.getElementById("lang-current-code");
  const langPopover = document.getElementById("lang-popover");
  const langOpts = document.querySelectorAll(".lang-opt");

  navPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      const targetTab = pill.dataset.tab;
      navPills.forEach((p) => p.classList.remove("active"));
      tabPanes.forEach((pane) => pane.classList.remove("active"));

      pill.classList.add("active");
      const activePane = document.getElementById(targetTab);
      if (activePane) activePane.classList.add("active");
    });
  });

  if (btnLangTrigger && langPopover) {
    btnLangTrigger.addEventListener("click", (e) => {
      e.stopPropagation();
      langPopover.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!langPopover.contains(e.target) && e.target !== btnLangTrigger) {
        langPopover.classList.add("hidden");
      }
    });
  }

  function setUiLangState(langCode) {
    const normalized = UI_I18N[langCode] ? langCode : "en";
    activeUiLang = normalized;

    langOpts.forEach((opt) => {
      const isMatch = opt.dataset.lang === normalized;
      opt.classList.toggle("active", isMatch);
      if (isMatch && langCurrentCode) {
        langCurrentCode.textContent = opt.dataset.code || "EN";
      }
    });

    applyInterfaceLanguage(normalized);
    renderLiveHudPreview();
    renderSlotCards();
  }

  langOpts.forEach((opt) => {
    opt.addEventListener("click", () => {
      setUiLangState(opt.dataset.lang);
      langPopover.classList.add("hidden");
      autoSaveNow();
    });
  });

  // 2. Tab 1: General (Operating Mode, Source Language, Target Language)
  const modeSegButtons = document.querySelectorAll("#companion-mode-segmented .seg-btn");
  const sourceLangChips = document.querySelectorAll("#source-lang-chips .chip");
  const targetLangChips = document.querySelectorAll("#target-lang-chips .chip");
  const checkShowCapsule = document.getElementById("check-show-capsule");

  if (checkShowCapsule) {
    checkShowCapsule.addEventListener("change", () => autoSaveNow());
  }

  function setCompanionModeState(mode) {
    activeCompanionMode = mode || "english";
    modeSegButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.mode === activeCompanionMode);
    });
  }

  modeSegButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setCompanionModeState(btn.dataset.mode);
      autoSaveNow();
    });
  });

  function setSourceLangState(slang) {
    activeSourceLang = slang || "zh";
    sourceLangChips.forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.slang === activeSourceLang);
    });
  }

  sourceLangChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      setSourceLangState(chip.dataset.slang);
      autoSaveNow();
    });
  });

  function setTargetLangState(tlang) {
    activeTargetLang = tlang || "en";
    targetLangChips.forEach((chip) => {
      chip.classList.toggle("active", chip.dataset.tlang === activeTargetLang);
    });
    renderLiveHudPreview();
  }

  targetLangChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      setTargetLangState(chip.dataset.tlang);
      autoSaveNow();
    });
  });

  // 3. Tab 2: Cards (Live Preview, Natural Language Tuner, Visible Rows, Advanced Slots)
  const liveHudPreview = document.getElementById("live-hud-preview");
  const inputAiWish = document.getElementById("input-ai-wish");
  const btnAiTune = document.getElementById("btn-ai-tune");
  const wishChips = document.querySelectorAll("#wish-bubbles .wish-chip");
  const aiTuneFeedback = document.getElementById("ai-tune-feedback");

  const toggleShowSource = document.getElementById("toggle-show-source");
  const toggleDualStyle = document.getElementById("toggle-dual-style");
  const toggleShowMeaning = document.getElementById("toggle-show-meaning");
  const toggleShowVocab = document.getElementById("toggle-show-vocab");

  const slotCardList = document.getElementById("slot-card-list");
  const btnAddSlot = document.getElementById("btn-add-slot");
  const btnResetSlots = document.getElementById("btn-reset-slots");

  function getDefaultSlotsList() {
    return [
      { id: "source", label: "Source", role: "source", enabled: true },
      {
        id: "spoken",
        label: "Casual",
        role: "translation",
        instruction: "Natural, fluent spoken flow for daily chat and team messages.",
        showMeaning: true,
        enabled: true,
      },
      {
        id: "written",
        label: "Formal",
        role: "translation",
        instruction: "Clear, polite, formal written expression for emails and documentation.",
        showMeaning: true,
        enabled: true,
      },
      {
        id: "vocab",
        label: "Vocab",
        role: "vocab",
        instruction: "Extract 2-3 key idiomatic phrases or collocations.",
        enabled: true,
      },
    ];
  }

  const PREVIEW_SAMPLES = {
    en: {
      source: "这个功能明天能上线吗？",
      trans1: "Can we ship this feature tomorrow?",
      meaning1: "Casual & natural for team chat",
      trans2: "Is this feature scheduled for release tomorrow?",
      meaning2: "Polite & formal for emails or docs",
      vocab: "ship (release) · be scheduled for (planned for)",
    },
    ja: {
      source: "这个功能明天能上线吗？",
      trans1: "この機能、明日出せるかな？",
      meaning1: "Casual phrasing among teammates",
      trans2: "こちらの機能は明日リリース予定でしょうか？",
      meaning2: "Polite workplace honorifics (Keigo)",
      vocab: "リリース (release) · 予定 (schedule)",
    },
    zh: {
      source: "Can we ship this feature tomorrow?",
      trans1: "这个功能明天能发吗？",
      meaning1: "Casual daily team chat",
      trans2: "请问该功能预计明天可以正式上线吗？",
      meaning2: "Polite formal workplace communication",
      vocab: "上线 (go live) · 预计 (scheduled)",
    },
    es: {
      source: "这个功能明天能上线吗？",
      trans1: "¿Podemos lanzar esta función mañana?",
      meaning1: "Natural spoken question",
      trans2: "¿Está programado el lanzamiento de esta función para mañana?",
      meaning2: "Formal business phrasing",
      vocab: "lanzar (launch) · programado (scheduled)",
    },
    de: {
      source: "这个功能明天能上线吗？",
      trans1: "Können wir das Feature morgen live schalten?",
      meaning1: "Direct team chat",
      trans2: "Ist die Veröffentlichung dieser Funktion für morgen geplant?",
      meaning2: "Formal written prose",
      vocab: "live schalten (go live) · Veröffentlichung (release)",
    },
    fr: {
      source: "这个功能明天能上线吗？",
      trans1: "On peut lancer cette fonctionnalité demain ?",
      meaning1: "Casual question to colleagues",
      trans2: "La mise en ligne de cette fonctionnalité est-elle prévue pour demain ?",
      meaning2: "Formal written expression",
      vocab: "lancer (launch) · mise en ligne (release)",
    },
    ko: {
      source: "这个功能明天能上线吗？",
      trans1: "이 기능 내일 배포할 수 있을까요?",
      meaning1: "Friendly daily team communication",
      trans2: "해당 기능의 내일 정식 출시가 가능한지 확인 부탁드립니다.",
      meaning2: "Formal business & email expression",
      vocab: "배포하다 (deploy) · 출시 (release)",
    },
    ru: {
      source: "这个功能明天能上线吗？",
      trans1: "Сможем выкатить эту фичу завтра?",
      meaning1: "Разговорный стиль для чата команды",
      trans2: "Запланирован ли релиз данной функции на завтра?",
      meaning2: "Деловой формальный стиль для переписки",
      vocab: "выкатить (ship/deploy) · релиз (release)",
    },
    pt: {
      source: "这个功能明天能上线吗？",
      trans1: "Podemos lançar esse recurso amanhã?",
      meaning1: "Tom casual para chat de equipe",
      trans2: "O lançamento desta funcionalidade está previsto para amanhã?",
      meaning2: "Formal e profissional para e-mails ou docs",
      vocab: "lançar (ship/release) · previsto para (scheduled for)",
    },
    it: {
      source: "这个功能明天能上线吗？",
      trans1: "Riusciamo a rilasciare questa funzionalità domani?",
      meaning1: "Tono colloquiale per chat di team",
      trans2: "Il rilascio di questa funzionalità è previsto per domani?",
      meaning2: "Formale e professionale per email e documentazione",
      vocab: "rilasciare (ship/release) · previsto per (scheduled for)",
    },
  };

  function renderLiveHudPreview() {
    if (!liveHudPreview) return;
    const sample = PREVIEW_SAMPLES[activeTargetLang] || PREVIEW_SAMPLES.en;
    const enabledSlots = currentSlots.filter((s) => s.enabled !== false);

    if (enabledSlots.length === 0) {
      liveHudPreview.innerHTML = `<div class="preview-row"><span class="preview-text" style="color:#a8a29e;">No active rows selected</span></div>`;
      return;
    }

    const sourceSlot = enabledSlots.find((s) => s.role === "source" || s.id === "source");
    const branchSlots = enabledSlots.filter((s) => s.role !== "source" && s.id !== "source");

    let html = "";

    if (sourceSlot) {
      html += `
        <div class="preview-row">
          <span class="preview-tag source">[${escapeHtml(sourceSlot.label || "Source")}]</span>
          <span class="preview-text">${escapeHtml(sample.source)}</span>
          <span class="preview-meta">${escapeHtml(t("meta_orig"))}</span>
        </div>
      `;
    }

    // Mode-aware live preview:
    // - "english" (2 · Direct): 1 fast direct translation line
    // - "select" (3 · Candidates): 3 interpersonal tones (Casual / Polite / Concise)
    // - "original" (1 · Learn): user's configured companion slots
    if (activeEngineMode === "free" || activeCompanionMode === "english") {
      html += `
        <div class="preview-row">
          <span class="preview-tag">[1] Direct</span>
          <span class="preview-text">${escapeHtml(sample.trans1)}</span>
          <span class="preview-meta">${escapeHtml(t("meta_key").replace("{n}", "1"))}</span>
        </div>
      `;
      liveHudPreview.innerHTML = html;
      return;
    }

    if (activeCompanionMode === "select") {
      html += `
        <div class="preview-row">
          <span class="preview-tag">[1] Casual</span>
          <span class="preview-text">${escapeHtml(sample.trans1)}</span>
          <span class="preview-meta">${escapeHtml(t("meta_key").replace("{n}", "1"))}</span>
        </div>
        <div class="preview-row">
          <span class="preview-tag">[2] Polite</span>
          <span class="preview-text">${escapeHtml(sample.trans2)}</span>
          <span class="preview-meta">${escapeHtml(t("meta_key").replace("{n}", "2"))}</span>
        </div>
        <div class="preview-row">
          <span class="preview-tag">[3] Concise</span>
          <span class="preview-text">${escapeHtml(sample.trans2)}</span>
          <span class="preview-meta">${escapeHtml(t("meta_key").replace("{n}", "3"))}</span>
        </div>
      `;
      liveHudPreview.innerHTML = html;
      return;
    }

    let transIdx = 0;
    branchSlots.forEach((slot, i) => {
      const isLast = i === branchSlots.length - 1;
      const treeChar = isLast ? "└" : "├";

      if (slot.role === "vocab") {
        html += `
          <div class="preview-row">
            <span class="preview-tree">${treeChar}</span>
            <span class="preview-tag vocab">[${escapeHtml(slot.label || "Vocab")}]</span>
            <span class="preview-text">${escapeHtml(sample.vocab)}</span>
            <span class="preview-meta">${escapeHtml(t("meta_vocab"))}</span>
          </div>
        `;
      } else {
        transIdx++;
        const mainText = transIdx === 1 ? sample.trans1 : sample.trans2;
        const meaningText = transIdx === 1 ? sample.meaning1 : sample.meaning2;
        const showMeaning = slot.showMeaning !== false;

        html += `
          <div class="preview-row">
            <span class="preview-tree">${treeChar}</span>
            <span class="preview-tag">[${transIdx}] ${escapeHtml(slot.label || "Translation")}</span>
            <span class="preview-text">${escapeHtml(mainText)}</span>
            ${showMeaning ? `<span class="preview-nuance">(${escapeHtml(meaningText)})</span>` : ""}
            <span class="preview-meta">${escapeHtml(t("meta_key").replace("{n}", String(transIdx)))}</span>
          </div>
        `;
      }
    });

    liveHudPreview.innerHTML = html;
  }

  function syncSimpleTogglesFromSlots() {
    const hasSource = currentSlots.some((s) => (s.role === "source" || s.id === "source") && s.enabled !== false);
    const transSlots = currentSlots.filter((s) => (s.role === "translation" || s.role === "custom") && s.enabled !== false);
    const hasDual = transSlots.length >= 2;
    const hasMeaning = transSlots.some((s) => s.showMeaning !== false);
    const hasVocab = currentSlots.some((s) => s.role === "vocab" && s.enabled !== false);

    if (toggleShowSource) toggleShowSource.checked = hasSource;
    if (toggleDualStyle) toggleDualStyle.checked = hasDual;
    if (toggleShowMeaning) toggleShowMeaning.checked = hasMeaning;
    if (toggleShowVocab) toggleShowVocab.checked = hasVocab;
  }

  function applySimpleToggleChange() {
    const wantSource = toggleShowSource ? toggleShowSource.checked : true;
    const wantDual = toggleDualStyle ? toggleDualStyle.checked : true;
    const wantMeaning = toggleShowMeaning ? toggleShowMeaning.checked : true;
    const wantVocab = toggleShowVocab ? toggleShowVocab.checked : false;

    const existingTrans = currentSlots.filter((s) => s.role === "translation" || s.role === "custom");
    const firstTrans = existingTrans[0] || {
      id: "spoken",
      label: wantDual ? "Casual" : "Translation",
      role: "translation",
      instruction: "Natural, fluent everyday expression.",
    };
    const secondTrans = existingTrans[1] || {
      id: "written",
      label: "Formal",
      role: "translation",
      instruction: "Clear, polite, formal written expression.",
    };

    const existingSource = currentSlots.find((s) => s.role === "source" || s.id === "source");
    const existingVocab = currentSlots.find((s) => s.role === "vocab");

    const nextSlots = [];
    if (wantSource) {
      nextSlots.push({
        id: "source",
        label: existingSource?.label || "Source",
        role: "source",
        enabled: true,
      });
    }

    const firstLabel =
      firstTrans.label && firstTrans.label !== "Casual" && firstTrans.label !== "Translation"
        ? firstTrans.label
        : wantDual
        ? "Casual"
        : "Translation";

    nextSlots.push({
      ...firstTrans,
      label: firstLabel,
      showMeaning: wantMeaning,
      enabled: true,
    });

    if (wantDual) {
      const secondLabel =
        secondTrans.label && secondTrans.label !== "Formal"
          ? secondTrans.label
          : "Formal";
      nextSlots.push({
        ...secondTrans,
        label: secondLabel,
        showMeaning: wantMeaning,
        enabled: true,
      });
    }

    if (wantVocab) {
      nextSlots.push({
        id: "vocab",
        label: existingVocab?.label || "Vocab",
        role: "vocab",
        instruction: existingVocab?.instruction || "Extract 2-3 key idiomatic phrases or collocations.",
        enabled: true,
      });
    }

    currentSlots = nextSlots;
    renderLiveHudPreview();
    renderSlotCards();
    autoSaveNow();
  }

  [toggleShowSource, toggleDualStyle, toggleShowMeaning, toggleShowVocab].forEach((el) => {
    if (el) {
      el.addEventListener("change", applySimpleToggleChange);
    }
  });

  async function runAiSlotTuner(wishText) {
    const text = (wishText || "").trim();
    if (!text) return;

    if (inputAiWish) inputAiWish.value = text;
    if (btnAiTune) {
      btnAiTune.disabled = true;
      btnAiTune.textContent = "...";
    }

    try {
      let res = null;
      if (window.lingualSettingsAPI?.aiTuneSlots) {
        res = await window.lingualSettingsAPI.aiTuneSlots(text);
      }

      if (res && res.success && Array.isArray(res.slots)) {
        currentSlots = res.slots;
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        renderSlotCards();
        await autoSaveNow();

        if (aiTuneFeedback) {
          aiTuneFeedback.textContent = res.summary || t("footer_saved");
          aiTuneFeedback.classList.remove("hidden");
        }
      }
    } catch (err) {
      console.error("AI slot tune error:", err);
    } finally {
      if (btnAiTune) {
        btnAiTune.disabled = false;
        btnAiTune.textContent = t("ai_tuner_btn");
      }
    }
  }

  if (btnAiTune) {
    btnAiTune.addEventListener("click", () => {
      runAiSlotTuner(inputAiWish?.value || "");
    });
  }

  if (inputAiWish) {
    inputAiWish.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        runAiSlotTuner(inputAiWish.value);
      }
    });
  }

  wishChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      runAiSlotTuner(chip.dataset.wish || "");
    });
  });

  function renderSlotCards() {
    if (!slotCardList) return;
    slotCardList.innerHTML = "";

    currentSlots.forEach((slot, idx) => {
      const card = document.createElement("div");
      card.className = "slot-row-item";

      const isSource = slot.role === "source";
      const isVocab = slot.role === "vocab";
      const hasNuance = !isSource && !isVocab;

      card.innerHTML = `
        <div class="slot-row-top">
          <span class="slot-idx">#${idx + 1}</span>
          <input type="checkbox" class="slot-checkbox" ${slot.enabled !== false ? "checked" : ""} />
          <input type="text" class="input-text slot-label-input" value="${escapeHtml(slot.label || "")}" placeholder="Label" />
          <select class="slot-role-select">
            <option value="translation" ${slot.role === "translation" || slot.role === "custom" ? "selected" : ""}>Translation</option>
            <option value="vocab" ${slot.role === "vocab" ? "selected" : ""}>Vocab</option>
            <option value="source" ${slot.role === "source" ? "selected" : ""}>Source</option>
          </select>
          ${hasNuance ? `
            <label class="slot-nuance-lbl">
              <input type="checkbox" class="nuance-check" ${slot.showMeaning !== false ? "checked" : ""} />
              <span>Nuance</span>
            </label>
          ` : ""}
          <button type="button" class="btn-icon-subtle btn-del-slot" title="Remove row">✕</button>
        </div>
        ${!isSource ? `
          <input type="text" class="input-text slot-inst-input" value="${escapeHtml(slot.instruction || "")}" placeholder="Prompt instruction..." />
        ` : ""}
      `;

      card.querySelector(".slot-checkbox").addEventListener("change", (e) => {
        slot.enabled = e.target.checked;
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        autoSaveNow();
      });

      card.querySelector(".slot-label-input").addEventListener("input", (e) => {
        slot.label = e.target.value.trim();
        renderLiveHudPreview();
        autoSaveNow();
      });

      card.querySelector(".slot-role-select").addEventListener("change", (e) => {
        slot.role = e.target.value;
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        renderSlotCards();
        autoSaveNow();
      });

      const nuanceCheck = card.querySelector(".nuance-check");
      if (nuanceCheck) {
        nuanceCheck.addEventListener("change", (e) => {
          slot.showMeaning = e.target.checked;
          syncSimpleTogglesFromSlots();
          renderLiveHudPreview();
          autoSaveNow();
        });
      }

      const inputInst = card.querySelector(".slot-inst-input");
      if (inputInst) {
        inputInst.addEventListener("input", (e) => {
          slot.instruction = e.target.value;
          autoSaveNow();
        });
      }

      card.querySelector(".btn-del-slot").addEventListener("click", () => {
        currentSlots.splice(idx, 1);
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        renderSlotCards();
        autoSaveNow();
      });

      slotCardList.appendChild(card);
    });
  }

  if (btnAddSlot) {
    btnAddSlot.addEventListener("click", () => {
      currentSlots.push({
        id: "custom_" + Date.now().toString(36),
        label: "Custom",
        role: "translation",
        instruction: "Express the message naturally and clearly.",
        showMeaning: true,
        enabled: true,
      });
      syncSimpleTogglesFromSlots();
      renderLiveHudPreview();
      renderSlotCards();
      autoSaveNow();
    });
  }

  if (btnResetSlots) {
    btnResetSlots.addEventListener("click", () => {
      currentSlots = getDefaultSlotsList();
      syncSimpleTogglesFromSlots();
      renderLiveHudPreview();
      renderSlotCards();
      autoSaveNow();
    });
  }

  // 4. Tab 3: Translation Engine (Pi Reuse vs Free Web vs Custom/Free-Tier LLM)
  const engineModeCards = document.querySelectorAll("#engine-mode-list .choice-card");
  const cloudConfigBox = document.getElementById("cloud-config-box");
  const piModelBadge = document.getElementById("pi-model-badge");

  const modelPresetChips = document.querySelectorAll("#model-preset-chips .chip");
  const inputEndpoint = document.getElementById("input-endpoint");
  const inputApiKey = document.getElementById("input-apikey");
  const inputModel = document.getElementById("input-model");
  const btnToggleKey = document.getElementById("btn-toggle-key");
  const btnTestConnection = document.getElementById("btn-test-connection");
  const testStatus = document.getElementById("test-status");
  const testStatusText = document.getElementById("test-status-text");

  const MODEL_PRESETS = {
    zhipu_free: {
      endpoint: "https://open.bigmodel.cn/api/paas/v4/chat/completions",
      model: "glm-4-flash",
    },
    siliconflow_free: {
      endpoint: "https://api.siliconflow.cn/v1/chat/completions",
      model: "Qwen/Qwen2.5-7B-Instruct",
    },
    groq_free: {
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      model: "llama-3.3-70b-versatile",
    },
    deepseek: {
      endpoint: "https://api.deepseek.com/v1/chat/completions",
      model: "deepseek-chat",
    },
    openai: {
      endpoint: "https://api.openai.com/v1/chat/completions",
      model: "gpt-4o-mini",
    },
  };

  function setEngineModeUI(mode) {
    activeEngineMode = mode || "pi";
    const isFreeWeb = activeEngineMode === "free";

    engineModeCards.forEach((card) => {
      card.classList.toggle("active", card.dataset.emode === activeEngineMode);
    });
    if (cloudConfigBox) {
      cloudConfigBox.style.display = activeEngineMode === "custom" ? "flex" : "none";
    }

    // Sync Cards tab availability: Free Web Translate is non-LLM and only supports 1 line + optional Source row
    const freeNotice = document.getElementById("free-engine-card-notice");
    const aiTunerCard = document.getElementById("ai-tuner-card-box");
    if (freeNotice) {
      freeNotice.classList.toggle("hidden", !isFreeWeb);
    }
    if (aiTunerCard) {
      aiTunerCard.style.opacity = isFreeWeb ? "0.45" : "1";
      aiTunerCard.style.pointerEvents = isFreeWeb ? "none" : "auto";
    }
    [toggleDualStyle, toggleShowMeaning, toggleShowVocab].forEach((chk) => {
      if (chk) {
        chk.disabled = isFreeWeb;
        const labelParent = chk.closest(".toggle-item");
        if (labelParent) {
          labelParent.style.opacity = isFreeWeb ? "0.45" : "1";
        }
      }
    });

    renderLiveHudPreview();
  }

  engineModeCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("input, button, details, summary")) return;
      const mode = card.dataset.emode;
      setEngineModeUI(mode);

      if (mode === "custom" && (!inputEndpoint.value || inputEndpoint.value.includes("127.0.0.1"))) {
        inputEndpoint.value = MODEL_PRESETS.zhipu_free.endpoint;
        inputModel.value = MODEL_PRESETS.zhipu_free.model;
      }
      autoSaveNow();
    });
  });

  modelPresetChips.forEach((chip) => {
    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      setEngineModeUI("custom");
      const presetKey = chip.dataset.preset;
      modelPresetChips.forEach((c) => c.classList.remove("active"));
      chip.classList.add("active");

      const preset = MODEL_PRESETS[presetKey];
      if (preset) {
        inputEndpoint.value = preset.endpoint;
        inputModel.value = preset.model;
        autoSaveNow();
      }
    });
  });

  if (inputApiKey) {
    inputApiKey.addEventListener("input", () => autoSaveNow());
  }
  if (inputEndpoint) {
    inputEndpoint.addEventListener("input", () => autoSaveNow());
  }
  if (inputModel) {
    inputModel.addEventListener("input", () => autoSaveNow());
  }

  if (btnToggleKey) {
    btnToggleKey.addEventListener("click", () => {
      if (inputApiKey.type === "password") {
        inputApiKey.type = "text";
        btnToggleKey.textContent = t("btn_hide");
      } else {
        inputApiKey.type = "password";
        btnToggleKey.textContent = t("btn_show");
      }
    });
  }

  if (btnTestConnection) {
    btnTestConnection.addEventListener("click", async () => {
      const endpoint = inputEndpoint.value.trim();
      const apiKey = inputApiKey.value.trim();
      const model = inputModel.value.trim();

      testStatus.classList.remove("hidden");
      testStatusText.textContent = "Testing connection...";

      try {
        const res = await window.lingualSettingsAPI?.testConnection({ endpoint, apiKey, model });
        if (res && res.success) {
          testStatusText.textContent = `Connected (${res.latencyMs}ms)`;
          await autoSaveNow();
        } else {
          testStatusText.textContent = `Connection failed (${res?.error || "Check API Key"}). Free web fallback active.`;
        }
      } catch (err) {
        testStatusText.textContent = `Error: ${err.message}`;
      }
    });
  }

  // 5. Auto-Save & Window Controls
  const btnClose = document.getElementById("btn-window-close");
  const btnCancel = document.getElementById("btn-cancel");
  const btnSave = document.getElementById("btn-save");
  const btnOpenLogs = document.getElementById("btn-open-logs");
  const saveStatus = document.getElementById("save-status");

  btnOpenLogs?.addEventListener("click", () => {
    window.lingualSettingsAPI?.openLogFile?.();
  });

  async function autoSaveNow() {
    if (isInitialLoading) return;
    const patch = {
      uiLang: activeUiLang,
      engineProvider: activeEngineMode,
      mode: activeCompanionMode,
      sourceLang: activeSourceLang,
      targetLang: activeTargetLang,
      slotPreset: activeSlotPreset,
      slots: currentSlots,
      hotkeySubmit: "Enter",
      autoSend: true,
      showCapsule: checkShowCapsule ? checkShowCapsule.checked : true,
    };

    if (activeEngineMode === "custom") {
      patch.endpoint = inputEndpoint ? inputEndpoint.value.trim() : "";
      patch.apiKey = inputApiKey ? inputApiKey.value.trim() : "";
      patch.model = inputModel ? inputModel.value.trim() : "";
    }

    try {
      await window.lingualSettingsAPI?.saveConfig(patch);
      if (saveStatus) {
        saveStatus.textContent = t("footer_saved");
        saveStatus.style.color = "#16a34a";
        setTimeout(() => {
          if (saveStatus) {
            saveStatus.textContent = t("footer_hint");
            saveStatus.style.color = "";
          }
        }, 2200);
      }
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  }

  function handleCloseWindow() {
    try {
      window.lingualSettingsAPI?.closeWindow();
    } catch {}
    try {
      window.close();
    } catch {}
  }

  btnClose?.addEventListener("click", handleCloseWindow);
  btnCancel?.addEventListener("click", handleCloseWindow);
  btnSave?.addEventListener("click", async () => {
    await autoSaveNow();
    handleCloseWindow();
  });

  async function loadConfig() {
    isInitialLoading = true;
    try {
      const cfg = await window.lingualSettingsAPI?.getConfig();
      if (!cfg) {
        currentSlots = getDefaultSlotsList();
        setUiLangState("zh");
        setSourceLangState("zh");
        setTargetLangState("en");
        setEngineModeUI("pi");
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        renderSlotCards();
        isInitialLoading = false;
        return;
      }

      setCompanionModeState(cfg.mode || "english");
      setSourceLangState(cfg.sourceLang || "zh");
      setTargetLangState(cfg.targetLang || "en");
      if (checkShowCapsule) {
        checkShowCapsule.checked = cfg.showCapsule !== false;
      }

      currentSlots = Array.isArray(cfg.slots) && cfg.slots.length > 0 ? cfg.slots : getDefaultSlotsList();
      setUiLangState(cfg.uiLang || "zh");
      syncSimpleTogglesFromSlots();
      renderLiveHudPreview();
      renderSlotCards();

      if (piModelBadge) {
        if (cfg.piModelInfo && cfg.piModelInfo.model) {
          piModelBadge.textContent = `Active: ${cfg.piModelInfo.model}`;
        } else {
          piModelBadge.textContent = "Auto-Fallback";
        }
      }

      setEngineModeUI(cfg.engineProvider || (cfg.piModelInfo ? "pi" : "free"));

      if (cfg.engineProvider === "custom") {
        inputEndpoint.value = cfg.endpoint || "";
        inputApiKey.value = cfg.apiKey || "";
        inputModel.value = cfg.model || "";
      }
    } catch (e) {
      console.error("Failed to load config:", e);
    } finally {
      isInitialLoading = false;
    }
  }

  window.lingualSettingsAPI?.onModeChanged?.((data) => {
    const newMode = typeof data === "string" ? data : data?.mode;
    if (newMode && newMode !== activeCompanionMode) {
      setCompanionModeState(newMode);
      renderLiveHudPreview();
    }
  });

  loadConfig();
})();
