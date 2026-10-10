// ============================================================================
// Lingual Desktop Settings Logic
// - 100% Full Interface i18n (zh / zh-TW / en / ja) — Zero Chinese Residue in EN/JA
// - 3 Core Companion Modes (Translate / Original / Off)
// - Non-Intrusive Shortcuts (Alt+E / Alt+S / Alt+Enter — Never hijacks Enter or Ctrl+Enter)
// - Real-Time WYSIWYG Live HUD Preview + Built-in Conversational AI Tuner
// - Instant Auto-Save on Every Click
// ============================================================================

(function () {
  // 0. Complete UI Internationalization Dictionary (Primary Language Sovereignty)
  const UI_I18N = {
    zh: {
      nav_flow: "⌨️ 模式与打字",
      nav_slots: "💬 卡片样式与 AI 定制",
      nav_model: "⚡ 翻译引擎 (免配置)",
      sec_mode_title: "1. 当前运行模式（随时按 Alt + Q 也可快速切换）",
      sec_mode_desc: "点击即可立即切换工作状态，完全无需重启：",
      mode_en_title: "🟢 译文模式 (Translate)",
      mode_en_sub: "打母语 ➔ 按快捷键直接变外语，并展开卡片对照",
      mode_orig_title: "🔵 原文模式 (Original)",
      mode_orig_sub: "输入框保留母语不替换，仅弹窗教你这句话外语怎么说",
      mode_off_title: "⚪ 暂停关闭 (Off)",
      mode_off_sub: "完全静默，不触发任何翻译或弹窗",
      sec_tlang_title: "2. 你想翻成什么目标语言？",
      sec_tlang_desc: "在任何聊天软件、浏览器或编辑器里打字，都会帮你翻成下面选中的语言。",
      tlang_en: "🇺🇸 英语 (English)",
      tlang_ja: "🇯🇵 日语 (日本語)",
      tlang_ko: "🇰🇷 韩语 (한국어)",
      tlang_fr: "🇫🇷 法语 (Français)",
      tlang_de: "🇩🇪 德语 (Deutsch)",
      tlang_es: "🇪🇸 西语 (Español)",
      tlang_zh: "🇨🇳 中文 (Chinese)",
      sec_hotkey_title: "3. 按哪个快捷键触发翻译？（绝不抢占你的回车和 Ctrl+Enter 换行）",
      sec_hotkey_desc: "平时打字按 Enter 发送、按 Ctrl+Enter 换行完全不受影响；想把输入框里的草稿翻成外语时，按下方专属组合键：",
      hk_alte_sub: "默认推荐 · 顺手且绝不干扰打字换行",
      hk_alts_sub: "左手一键触发 · 适合高频快聊",
      hk_altenter_sub: "保留普通回车与 Ctrl+Enter 换行",
      sec_dispatch_title: "4. 译文模式下，翻译出来后怎么替你填进输入框？",
      dispatch_auto_title: "直接替我换好外语（省心直换）",
      dispatch_auto_badge: "最省事",
      dispatch_auto_flow: "打完草稿 ➔ 按快捷键 ➔ <strong>输入框直接变成地道外语</strong>",
      dispatch_auto_desc: "无需多按任何键，直接把输入框里的文字换成外语！同时旁边浮出 3 秒小卡片供你核对；万一想重改，<strong>3 秒内按 Esc 键立刻撤回恢复原草稿</strong>。",
      dispatch_pick_title: "先弹出小卡片，让我挑一句再上屏（先看后换）",
      dispatch_pick_flow: "打完草稿 ➔ 按快捷键弹出卡片 ➔ <strong>按数字 1 或 2 挑中上屏</strong>",
      dispatch_pick_desc: "按完快捷键后先不改输入框，而是在旁边弹出小卡片列出几种语气（如日常口语 vs 正式书面），你按键盘数字键挑中哪句才填进去。",
      preview_title: "👀 实时效果预览（弹出来的小卡片会长这样）：",
      preview_hint: "示例输入：「这个功能明天能上线吗？」",
      ai_tuner_title: "🤖 懒得自己调？直接用一句话告诉 AI 你平时打字用来干嘛",
      ai_tuner_desc: "像在终端里跟智能体说话一样，写出你的需求或点选下方气泡，AI 当场帮你配好上方卡片：",
      ai_tuner_placeholder: "例如：我只是为了打字，只要一行简单翻译，不要显示中文原话和单词...",
      ai_tuner_btn: "✨ 让 AI 帮我配好",
      wish_1: "💬 纯粹打字：只要1行干净译文，别显示原话和单词",
      wish_2: "💼 日常办公：同事群聊口语 + 正式文档书面语",
      wish_3: "📦 外贸客服：客气礼貌回复 + 简短干脆催单",
      wish_4: "🎮 游戏开黑：简短队友报点 + 社区闲聊",
      wish_5: "🐦 发推冲浪：吸睛短句 + 深度评论 + 顺便记词",
      wish_6: "🌸 日语伴学：朋友口语 + 职场敬语 + 重点单词",
      manual_toggle_title: "手动勾选：小卡片里你想看到哪几项？（勾选后实时改变上方预览）",
      tog_source_title: "第一行显示我打的原话",
      tog_source_desc: "取消勾选后，卡片里只显示翻译出来的外语，更小巧干净",
      tog_dual_title: "同时给 2 种语气让我对比（日常聊 vs 正式写）",
      tog_dual_desc: "取消勾选后，每次只给你 1 句最直接的翻译，不用做选择",
      tog_meaning_title: "每句外语下面用母语小字解释语气差别",
      tog_meaning_desc: "帮你一眼看懂哪句更随意、哪句更礼貌；纯打字熟手可以关掉",
      tog_vocab_title: "在卡片最底下顺便挑 2 个实用好词教我",
      tog_vocab_desc: "边打字边顺便记点好词；如果只想纯粹打字，取消勾选即可",
      adv_slots_summary: "▸ 高级自定义：手动修改每一行的标签名称、增删行数或编写提示词",
      btn_add_row: "+ 新增一行",
      btn_reset_rows: "恢复默认",
      banner_ready_title: "开箱即用已就绪：已自动接入本机 Pi 模型与国内直连免费翻译双通道！",
      banner_ready_desc: "无需填写任何密钥，现在就可以直接按 Alt+E 打字翻译。下方也可随时切换其他引擎：",
      engine_choose_title: "选择你的翻译驱动方式",
      emode_free_title: "🌱 直接用内置免费快速翻译（国内直连 · 零配置即用）",
      emode_free_desc: "无需任何账号或密钥，国内网络直接秒连，适合日常直接把一句话翻成外语。",
      emode_local_title: "💻 用我电脑里装好的本地 AI (Ollama / LM Studio)",
      btn_detect_local: "🔍 一键自动检测连接",
      emode_local_desc: "完全免费且保护隐私。如果你电脑上开着 Ollama，点右侧按钮就能自动连上，无需手填网址。",
      emode_cloud_title: "🚀 AI 大模型驱动（已自动继承本机 Pi 模型配置 / 可填自定义密钥）",
      emode_cloud_desc: "支持同时生成“日常口语 + 正式书面语”对比及重点词汇讲解：",
      lbl_apikey: "API Key (密钥)",
      btn_show_key: "显示",
      btn_hide_key: "隐藏",
      btn_test_conn: "⚡ 测试连接",
      adv_endpoint_summary: "▸ 高级：手动修改接口网址 (Endpoint) 与模型名称",
      footer_hint: "✅ 所有选项点击即自动生效（无需手动保存）",
      footer_saved: "✅ 已自动保存并生效！现在去任何输入框按 Alt+E 试试吧",
      btn_close: "关闭窗口",
      btn_save: "保存并关闭",
      pill_source: "← 你打的原话",
      pill_pick: "← 按数字 {n} 选这句",
      pill_vocab: "← 顺便挑2个好词教你",
      default_lbl_source: "原话",
      default_lbl_spoken: "日常聊",
      default_lbl_written: "正式写",
      default_lbl_single: "地道译文",
      default_lbl_vocab: "顺便记词",
    },
    "zh-TW": {
      nav_flow: "⌨️ 模式與打字",
      nav_slots: "💬 卡片樣式與 AI 定制",
      nav_model: "⚡ 翻譯引擎 (免配置)",
      sec_mode_title: "1. 當前運行模式（隨時按 Alt + Q 也可快速切換）",
      sec_mode_desc: "點擊即可立即切換工作狀態，完全無需重啟：",
      mode_en_title: "🟢 譯文模式 (Translate)",
      mode_en_sub: "打母語 ➔ 按快捷鍵直接變外語，並展開卡片對照",
      mode_orig_title: "🔵 原文模式 (Original)",
      mode_orig_sub: "輸入框保留母語不替換，僅彈窗教你這句話外語怎麼說",
      mode_off_title: "⚪ 暫停關閉 (Off)",
      mode_off_sub: "完全靜默，不觸發任何翻譯或彈窗",
      sec_tlang_title: "2. 你想翻成什麼目標語言？",
      sec_tlang_desc: "在任何聊天軟體、瀏覽器或編輯器裡打字，都會幫你翻成下面選中的語言。",
      tlang_en: "🇺🇸 英語 (English)",
      tlang_ja: "🇯🇵 日語 (日本語)",
      tlang_ko: "🇰🇷 韓語 (한국어)",
      tlang_fr: "🇫🇷 法語 (Français)",
      tlang_de: "🇩🇪 德語 (Deutsch)",
      tlang_es: "🇪🇸 西語 (Español)",
      tlang_zh: "🇨🇳 中文 (Chinese)",
      sec_hotkey_title: "3. 按哪個快捷鍵觸發翻譯？（絕不搶佔你的 Enter 與 Ctrl+Enter 換行）",
      sec_hotkey_desc: "平時打字按 Enter 發送、按 Ctrl+Enter 換行完全不受影響；想把草稿翻成外語時，按下方專屬組合鍵：",
      hk_alte_sub: "默認推薦 · 順手且絕不干擾打字換行",
      hk_alts_sub: "左手一鍵觸發 · 適合高頻快聊",
      hk_altenter_sub: "保留普通 Enter 與 Ctrl+Enter 換行",
      sec_dispatch_title: "4. 譯文模式下，翻譯出來後怎麼替你填進輸入框？",
      dispatch_auto_title: "直接替我換好外語（省心直換）",
      dispatch_auto_badge: "最省事",
      dispatch_auto_flow: "打完草稿 ➔ 按快捷鍵 ➔ <strong>輸入框直接變成地道外語</strong>",
      dispatch_auto_desc: "無需多按任何鍵，直接把輸入框裡的文字換成外語！同時旁邊浮出 3 秒小卡片供你核對；3 秒內按 Esc 鍵可立即撤回。",
      dispatch_pick_title: "先彈出小卡片，讓我挑一句再上屏（先看後換）",
      dispatch_pick_flow: "打完草稿 ➔ 按快捷鍵彈出卡片 ➔ <strong>按數字 1 或 2 挑中上屏</strong>",
      dispatch_pick_desc: "按完快捷鍵後先不改輸入框，而是在旁邊彈出小卡片列出幾種語氣，你按鍵盤數字鍵挑中哪句才填進去。",
      preview_title: "👀 即時效果預覽（彈出來的小卡片會長這樣）：",
      preview_hint: "示例輸入：「這個功能明天能上線嗎？」",
      ai_tuner_title: "🤖 懶得自己調？直接用一句話告訴 AI 你平時打字用來幹嘛",
      ai_tuner_desc: "寫出你的需求或點選下方氣泡，AI 當場幫你配好上方卡片：",
      ai_tuner_placeholder: "例如：我只是為了打字，只要一行簡單翻譯，不要顯示原話和單詞...",
      ai_tuner_btn: "✨ 讓 AI 幫我配好",
      wish_1: "💬 純粹打字：只要1行乾淨譯文，別顯示原話和單詞",
      wish_2: "💼 日常辦公：同事群聊口語 + 正式文檔書面語",
      wish_3: "📦 外貿客服：客氣禮貌回覆 + 簡短乾脆催單",
      wish_4: "🎮 遊戲開黑：簡短隊友報點 + 社區閒聊",
      wish_5: "🐦 發推衝浪：吸睛短句 + 深度評論 + 順便記詞",
      wish_6: "🌸 日語伴學：朋友口語 + 職場敬語 + 重點單詞",
      manual_toggle_title: "手動勾選：小卡片裡你想看到哪幾項？（勾選後即時改變上方預覽）",
      tog_source_title: "第一行顯示我打的原話",
      tog_source_desc: "取消勾選後，卡片裡只顯示翻譯出來之外語，更小巧乾淨",
      tog_dual_title: "同時給 2 種語氣讓我對比（日常聊 vs 正式寫）",
      tog_dual_desc: "取消勾選後，每次只給你 1 句最直接的翻譯，不用做選擇",
      tog_meaning_title: "每句外語下面用母語小字解釋語氣差別",
      tog_meaning_desc: "幫你一眼看懂哪句更隨意、哪句更禮貌；純打字熟手可以關掉",
      tog_vocab_title: "在卡片最底下順便挑 2 個實用好詞教我",
      tog_vocab_desc: "邊打字邊順便記點好詞；如果只想純粹打字，取消勾選即可",
      adv_slots_summary: "▸ 高級自定義：手動修改每一行的標籤名稱、增刪行數或編寫提示詞",
      btn_add_row: "+ 新增一行",
      btn_reset_rows: "恢復默認",
      banner_ready_title: "開箱即用已就緒：已自動接入本機 Pi 模型與免費翻譯雙通道！",
      banner_ready_desc: "無需填寫任何密鑰，現在就可以直接按 Alt+E 打字翻譯：",
      engine_choose_title: "選擇你的翻譯驅動方式",
      emode_free_title: "🌱 直接用內置免費快速翻譯（零配置即用）",
      emode_free_desc: "無需任何帳號或密鑰，直接秒連，適合日常直接把一句話翻成外語。",
      emode_local_title: "💻 用我電腦裡裝好的本地 AI (Ollama / LM Studio)",
      btn_detect_local: "🔍 一鍵自動檢測連接",
      emode_local_desc: "完全免費且保護隱私。如果你電腦上開著 Ollama，點右側按鈕就能自動連上。",
      emode_cloud_title: "🚀 AI 大模型驅動（已自動繼承本機 Pi 模型配置 / 可填自定義密鑰）",
      emode_cloud_desc: "支持同時生成「日常口語 + 正式書面語」對比及重點詞彙講解：",
      lbl_apikey: "API Key (密鑰)",
      btn_show_key: "顯示",
      btn_hide_key: "隱藏",
      btn_test_conn: "⚡ 測試連接",
      adv_endpoint_summary: "▸ 高級：手動修改接口網址 (Endpoint) 與模型名稱",
      footer_hint: "✅ 所有選項點擊即自動生效（無需手動保存）",
      footer_saved: "✅ 已自動保存並生效！現在去任何輸入框按 Alt+E 試試吧",
      btn_close: "關閉窗口",
      btn_save: "保存並關閉",
      pill_source: "← 你打的原話",
      pill_pick: "← 按數字 {n} 選這句",
      pill_vocab: "← 順便挑2個好詞教你",
      default_lbl_source: "原話",
      default_lbl_spoken: "日常聊",
      default_lbl_written: "正式寫",
      default_lbl_single: "地道譯文",
      default_lbl_vocab: "順便記詞",
    },
    en: {
      nav_flow: "⌨️ Mode & Typing",
      nav_slots: "💬 Card Style & AI Setup",
      nav_model: "⚡ Engine (Zero-Setup)",
      sec_mode_title: "1. Active Companion Mode (Press Alt + Q anytime to cycle)",
      sec_mode_desc: "Click to switch immediately without restarting:",
      mode_en_title: "🟢 Translate Mode",
      mode_en_sub: "Type draft ➔ Press shortcut to replace with target language + show HUD",
      mode_orig_title: "🔵 Original Mode (Learn)",
      mode_orig_sub: "Keep your original text intact, only pop up HUD to show translations",
      mode_off_title: "⚪ Off (Paused)",
      mode_off_sub: "Completely silent, no translation or popup",
      sec_tlang_title: "2. Which target language do you want to translate into?",
      sec_tlang_desc: "Type in any chat app, browser, or editor and translate into the selected language below.",
      tlang_en: "🇺🇸 English",
      tlang_ja: "🇯🇵 Japanese (日本語)",
      tlang_ko: "🇰🇷 Korean (한국어)",
      tlang_fr: "🇫🇷 French (Français)",
      tlang_de: "🇩🇪 German (Deutsch)",
      tlang_es: "🇪🇸 Spanish (Español)",
      tlang_zh: "🇨🇳 Chinese (中文)",
      sec_hotkey_title: "3. Shortcut to Trigger Translation (Never hijacks Enter or Ctrl+Enter!)",
      sec_hotkey_desc: "Your normal Enter and Ctrl+Enter keys remain 100% untouched. Press this shortcut when you want to translate your draft:",
      hk_alte_sub: "Recommended · Ergonomic & never conflicts with newlines",
      hk_alts_sub: "Quick left-hand trigger for fast chat",
      hk_altenter_sub: "Leaves normal Enter & Ctrl+Enter untouched",
      sec_dispatch_title: "4. In Translate Mode, how should the translation be inserted?",
      dispatch_auto_title: "Replace Directly (Instant Swap)",
      dispatch_auto_badge: "Fastest",
      dispatch_auto_flow: "Type draft ➔ Press Alt+E ➔ <strong>Input box updates immediately</strong>",
      dispatch_auto_desc: "Replaces your draft right away and shows a 3-second confirmation card. Press <strong>Esc within 3 seconds</strong> to undo and restore your original draft.",
      dispatch_pick_title: "Pop up Card First & Let Me Pick (Preview First)",
      dispatch_pick_flow: "Type draft ➔ Press Alt+E ➔ <strong>Press 1 or 2 to insert</strong>",
      dispatch_pick_desc: "Pops up the card beside your cursor showing Casual vs. Formal options. Press 1 or 2 on your keyboard to insert the one you prefer.",
      preview_title: "👀 Live Card Preview (How your popup card will look):",
      preview_hint: "Sample Input: \"Can we release this feature tomorrow?\"",
      ai_tuner_title: "🤖 Don't want to tweak manually? Tell AI what you use typing for in one sentence",
      ai_tuner_desc: "Just like chatting with an AI agent in terminal—type your wish or click a bubble below:",
      ai_tuner_placeholder: "e.g. Just give me 1 clean translation line for chatting, no source text or vocab...",
      ai_tuner_btn: "✨ Auto-Configure with AI",
      wish_1: "💬 Pure Typing: 1 clean translation line, no source or vocab",
      wish_2: "💼 Work & Office: Casual team chat + Formal email prose",
      wish_3: "📦 Customer Support: Polite reply + Concise follow-up",
      wish_4: "🎮 Gaming & Discord: Short callouts + Community banter",
      wish_5: "🐦 Social & X/Twitter: Punchy hook + Insightful reply + Vocab",
      wish_6: "🌸 Japanese Study: Casual spoken + Business polite Keigo + Vocab",
      manual_toggle_title: "Manual Toggles: What do you want to see on the card? (Updates Live Preview)",
      tog_source_title: "Show my original text on the first row",
      tog_source_desc: "Uncheck to show only the translated text for a more compact card",
      tog_dual_title: "Show 2 tone styles to compare (Casual vs. Formal)",
      tog_dual_desc: "Uncheck to show only 1 direct translation line every time",
      tog_meaning_title: "Show brief nuance explanation under each translation",
      tog_meaning_desc: "Helps you tell how casual or formal each phrasing is",
      tog_vocab_title: "Show 2-3 key vocabulary phrases at the bottom",
      tog_vocab_desc: "Learn idioms while typing; uncheck if you only want pure typing",
      adv_slots_summary: "▸ Advanced: Manually edit row labels, add/remove rows, or customize prompts",
      btn_add_row: "+ Add Row",
      btn_reset_rows: "Reset Default",
      banner_ready_title: "Ready Out-of-the-Box: Auto-connected to Local Pi Model & Zero-Key Fast Fallback!",
      banner_ready_desc: "No API key setup required—press Alt+E in any input box to translate right now.",
      engine_choose_title: "Choose Your Translation Engine",
      emode_free_title: "🌱 Built-in Free Fast Translation (Zero Setup)",
      emode_free_desc: "Works immediately with no account or API key required.",
      emode_local_title: "💻 Local AI on My Computer (Ollama / LM Studio)",
      btn_detect_local: "🔍 Auto-Detect Local AI",
      emode_local_desc: "100% free and private. Click the button on the right to auto-connect to Ollama.",
      emode_cloud_title: "🚀 AI LLM Engine (Auto-inherited from Pi or Custom API Key)",
      emode_cloud_desc: "Generates dual-register (Casual + Formal) comparisons and vocabulary notes:",
      lbl_apikey: "API Key",
      btn_show_key: "Show",
      btn_hide_key: "Hide",
      btn_test_conn: "⚡ Test Connection",
      adv_endpoint_summary: "▸ Advanced: Manually edit Endpoint URL & Model ID",
      footer_hint: "✅ Every click auto-saves and takes effect immediately",
      footer_saved: "✅ Saved & active! Try pressing Alt+E in any text box now",
      btn_close: "Close",
      btn_save: "Save & Close",
      pill_source: "← Your original draft",
      pill_pick: "← Press {n} to pick",
      pill_vocab: "← Key phrases",
      default_lbl_source: "Source",
      default_lbl_spoken: "Casual",
      default_lbl_written: "Formal",
      default_lbl_single: "Translation",
      default_lbl_vocab: "Vocab",
    },
    ja: {
      nav_flow: "⌨️ モードと入力",
      nav_slots: "💬 カード表示とAI設定",
      nav_model: "⚡ 翻訳エンジン (設定不要)",
      sec_mode_title: "1. 現在の動作モード（Alt + Q でいつでも切替可能）",
      sec_mode_desc: "クリックすると再起動なしで即座に切り替わります：",
      mode_en_title: "🟢 翻訳モード (Translate)",
      mode_en_sub: "母語を入力 ➔ ショートカットで外国語に置換＆カード表示",
      mode_orig_title: "🔵 原文モード (Original)",
      mode_orig_sub: "入力欄は母語のまま維持し、カードで外国語表現だけを学習",
      mode_off_title: "⚪ 一時停止 (Off)",
      mode_off_sub: "完全にスリープし、翻訳やポップアップを行いません",
      sec_tlang_title: "2. どの言語に翻訳しますか？",
      sec_tlang_desc: "チャットやブラウザ、エディタで入力した文章を選択した言語に翻訳します。",
      tlang_en: "🇺🇸 英語 (English)",
      tlang_ja: "🇯🇵 日本語 (Japanese)",
      tlang_ko: "🇰🇷 韓国語 (한국어)",
      tlang_fr: "🇫🇷 フランス語 (Français)",
      tlang_de: "🇩🇪 ドイツ語 (Deutsch)",
      tlang_es: "🇪🇸 スペイン語 (Español)",
      tlang_zh: "🇨🇳 中国語 (中文)",
      sec_hotkey_title: "3. 翻訳ショートカット（Enter や Ctrl+Enter の改行は奪いません！）",
      sec_hotkey_desc: "通常の Enter 送信や Ctrl+Enter 改行はそのまま使えます。翻訳したい時だけ以下のキーを押してください：",
      hk_alte_sub: "推奨 · 改行と一切競合しない快適なキー",
      hk_alts_sub: "左手ワンタッチで素早く翻訳",
      hk_altenter_sub: "通常の Enter / Ctrl+Enter を妨げない",
      sec_dispatch_title: "4. 翻訳された文章をどのように入力欄へ反映しますか？",
      dispatch_auto_title: "そのまま自動で置き換える（即時置換）",
      dispatch_auto_badge: "おすすめ",
      dispatch_auto_flow: "下書き ➔ Alt+E ➔ <strong>入力欄が即座に外国語へ変わる</strong>",
      dispatch_auto_desc: "余計なキー操作なしで即座に外国語へ置換！3秒以内に Esc キーを押せば元の文章に戻せます。",
      dispatch_pick_title: "先にカードを表示して選ばせる（確認してから置換）",
      dispatch_pick_flow: "下書き ➔ Alt+Eでカード表示 ➔ <strong>数字キー 1 または 2 で選択</strong>",
      dispatch_pick_desc: "口語と敬語/書き言葉を見比べてから、数字キーの 1 か 2 を押して反映します。",
      preview_title: "👀 リアルタイムプレビュー（ポップアップカードの表示イメージ）：",
      preview_hint: "入力例：「この機能、明日リリースできる？」",
      ai_tuner_title: "🤖 手動設定が面倒なら、AIに一言で用途を伝えてください",
      ai_tuner_desc: "下のバブルをクリックするか、普段の用途を入力するとAIが自動でカードを組み立てます：",
      ai_tuner_placeholder: "例：チャット用にシンプルな翻訳1行だけ表示して、原文や単語は不要...",
      ai_tuner_btn: "✨ AIに自動設定させる",
      wish_1: "💬 シンプル入力：翻訳1行のみ（原文・単語なし）",
      wish_2: "💼 ビジネス標準：チャット口語 + フォーマル文書",
      wish_3: "📦 カスタマー対応：丁寧な返信 + 簡潔なフォロー",
      wish_4: "🎮 ゲーム・Discord：短い連携チャット + 雑談",
      wish_5: "🐦 SNS・X投稿：目を引く短文 + 深い考察 + 単語",
      wish_6: "🌸 語学学習：フランクな口語 + 丁寧な敬語 + 重要単語",
      manual_toggle_title: "表示項目のチェック（チェックすると上のプレビューが即座に変わります）",
      tog_source_title: "1行目に自分が入力した原文を表示する",
      tog_source_desc: "オフにすると翻訳結果のみ表示されコンパクトになります",
      tog_dual_title: "2種類のトーン（日常口語 vs フォーマル）を並べて比較する",
      tog_dual_desc: "オフにすると毎回シンプルな翻訳1行のみ表示します",
      tog_meaning_title: "各翻訳の下にニュアンス解説を小さく表示する",
      tog_meaning_desc: "どのくらいカジュアルか丁寧かが一目で分かります",
      tog_vocab_title: "カードの一番下に役立つ単語・フレーズを2つ表示する",
      tog_vocab_desc: "入力しながら表現を学べます（不要ならオフ）",
      adv_slots_summary: "▸ 詳細設定：各行のラベル名・行の追加削除・プロンプトを手動編集",
      btn_add_row: "+ 行を追加",
      btn_reset_rows: "デフォルトに戻す",
      banner_ready_title: "すぐ使えます：ローカルPiモデル＆無料高速翻訳エンジンに自動接続済み！",
      banner_ready_desc: "APIキー設定なしで、今すぐ Alt+E を押して翻訳できます。",
      engine_choose_title: "翻訳エンジンの選択",
      emode_free_title: "🌱 内蔵の無料高速翻訳を使う（設定不要）",
      emode_free_desc: "アカウント登録やAPIキー不要ですぐに翻訳できます。",
      emode_local_title: "💻 パソコン内のローカル AI を使う (Ollama / LM Studio)",
      btn_detect_local: "🔍 ローカルAIを自動検出",
      emode_local_desc: "完全無料・プライバシー保護。右のボタンでOllamaに自動接続します。",
      emode_cloud_title: "🚀 AI 大規模モデル（Pi設定を自動継承 / カスタムAPIキー）",
      emode_cloud_desc: "日常口語とフォーマル表現の比較や単語解説を生成します：",
      lbl_apikey: "API Key",
      btn_show_key: "表示",
      btn_hide_key: "隠す",
      btn_test_conn: "⚡ 接続テスト",
      adv_endpoint_summary: "▸ 詳細：エンドポイントURLとモデル名を手動変更",
      footer_hint: "✅ クリックした項目はすべて即座に自動保存・反映されます",
      footer_saved: "✅ 自動保存されました！入力欄で Alt+E を試してみてください",
      btn_close: "閉じる",
      btn_save: "保存して閉じる",
      pill_source: "← 入力した原文",
      pill_pick: "← 数字 {n} で選択",
      pill_vocab: "← 重要フレーズ",
      default_lbl_source: "原文",
      default_lbl_spoken: "口語",
      default_lbl_written: "文面",
      default_lbl_single: "訳文",
      default_lbl_vocab: "単語",
    },
  };

  function t(key) {
    const dict = UI_I18N[activeLangCode] || UI_I18N.zh;
    return dict[key] || UI_I18N.zh[key] || key;
  }

  function applyInterfaceTranslations(langCode) {
    const dict = UI_I18N[langCode] || UI_I18N.zh;
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

  // 1. Top Pill Tabs Navigation
  const navPills = document.querySelectorAll(".nav-pill");
  const tabPanes = document.querySelectorAll(".tab-pane");

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

  // 2. Native & Interface Language Switcher Dropdown
  const btnLangTrigger = document.getElementById("btn-lang-trigger");
  const langCurrentShort = document.getElementById("lang-current-short");
  const langPopover = document.getElementById("lang-popover");
  const langOptions = document.querySelectorAll(".lang-option");

  let activeLangCode = "zh";
  let activeTargetLang = "en";
  let activeCompanionMode = "english";
  let selectedTriggerKey = "Alt+E";
  let activeSlotPreset = "developer";
  let currentSlots = [];
  let isInitialLoading = true;

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

  function localizeDefaultSlotLabels() {
    currentSlots.forEach((slot) => {
      if (slot.role === "source" && ["原话", "原文", "Source"].includes(slot.label)) {
        slot.label = t("default_lbl_source");
      } else if (slot.id === "spoken" && ["日常聊", "口语", "口語", "Casual", "Spoken"].includes(slot.label)) {
        slot.label = t("default_lbl_spoken");
      } else if (slot.id === "written" && ["正式写", "写作", "文面", "敬語", "Formal", "Written"].includes(slot.label)) {
        slot.label = t("default_lbl_written");
      } else if (slot.role === "vocab" && ["顺便记词", "重點", "重点", "単語", "Vocab", "Key Words"].includes(slot.label)) {
        slot.label = t("default_lbl_vocab");
      }
    });
  }

  function setLanguageState(langCode) {
    activeLangCode = UI_I18N[langCode] ? langCode : "zh";
    langOptions.forEach((opt) => {
      const isMatch = opt.dataset.lang === activeLangCode;
      opt.classList.toggle("active", isMatch);
      const dot = opt.querySelector(".opt-dot");
      if (dot) dot.textContent = isMatch ? "•" : "";
      if (isMatch && langCurrentShort) {
        langCurrentShort.textContent = opt.dataset.short || "🌐 简体中文";
      }
    });
    applyInterfaceTranslations(activeLangCode);
    localizeDefaultSlotLabels();
    renderLiveHudPreview();
    renderSlotCards();
  }

  langOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      setLanguageState(opt.dataset.lang);
      langPopover.classList.add("hidden");
      autoSaveNow();
    });
  });

  // 3. Tab 1: Companion Mode (Translate / Original / Off), Target Lang, Trigger Shortcut, Dispatch Mode
  const modeSegButtons = document.querySelectorAll("#companion-mode-segmented .seg-btn");
  const targetLangChips = document.querySelectorAll("#target-lang-chips .chip");
  const segButtons = document.querySelectorAll("#trigger-segmented .seg-btn");
  const modeChoiceCards = document.querySelectorAll("#autosend-choice-grid .mode-choice-card");
  const checkAutoSend = document.getElementById("check-auto-send");

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

  function setTriggerState(val) {
    // Sanitize legacy Enter / Ctrl+Enter so they never hijack normal typing
    const safeVal = !val || val.toLowerCase() === "enter" || val.toLowerCase() === "ctrl+enter" ? "Alt+E" : val;
    selectedTriggerKey = safeVal;
    segButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.val === selectedTriggerKey);
    });
  }

  segButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      setTriggerState(btn.dataset.val);
      autoSaveNow();
    });
  });

  function setAutoSendCardState(isAutoSend) {
    if (checkAutoSend) checkAutoSend.checked = Boolean(isAutoSend);
    modeChoiceCards.forEach((card) => {
      const cardVal = card.dataset.autosend === "true";
      card.classList.toggle("active", cardVal === Boolean(isAutoSend));
    });
  }

  modeChoiceCards.forEach((card) => {
    card.addEventListener("click", () => {
      setAutoSendCardState(card.dataset.autosend === "true");
      autoSaveNow();
    });
  });

  // 4. Tab 2: Live HUD Preview, Conversational AI Tuner & Simple Toggles
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

  function getDefaultFriendlySlots() {
    return [
      { id: "source", label: t("default_lbl_source"), role: "source", enabled: true },
      {
        id: "spoken",
        label: t("default_lbl_spoken"),
        role: "translation",
        instruction: "Natural, fluent spoken flow for daily chat and team messages.",
        showMeaning: true,
        enabled: true,
      },
      {
        id: "written",
        label: t("default_lbl_written"),
        role: "translation",
        instruction: "Clear, polite, formal written expression for emails and docs.",
        showMeaning: true,
        enabled: true,
      },
      {
        id: "vocab",
        label: t("default_lbl_vocab"),
        role: "vocab",
        instruction: "Extract 2-3 useful idiomatic words or phrases.",
        enabled: true,
      },
    ];
  }

  const PREVIEW_SAMPLES = {
    en: {
      source_zh: "这个功能明天能上线吗？",
      source_en: "Can we release this feature tomorrow?",
      trans1: "Can we ship this feature tomorrow?",
      meaning1_zh: "自然随和，适合平时在群里问同事",
      meaning1_en: "Casual & natural for team Slack chat",
      trans2: "Is this feature scheduled for release tomorrow?",
      meaning2_zh: "礼貌得体，适合发正式邮件或跟客户确认",
      meaning2_en: "Polite & formal for client emails or docs",
      vocab: "ship (release) · be scheduled for (planned for)",
    },
    ja: {
      source_zh: "这个功能明天能上线吗？",
      source_en: "Can we release this feature tomorrow?",
      trans1: "この機能、明日出せるかな？",
      meaning1_zh: "熟人同事间的自然随和口语",
      meaning1_en: "Casual spoken phrasing among teammates",
      trans2: "こちらの機能は明日リリース予定でしょうか？",
      meaning2_zh: "得体礼貌的职场标准敬语",
      meaning2_en: "Polite workplace honorifics (Keigo)",
      vocab: "リリース (release) · 予定 (schedule)",
    },
    ko: {
      source_zh: "这个功能明天能上线吗？",
      source_en: "Can we release this feature tomorrow?",
      trans1: "이 기능 내일 배포할 수 있을까요?",
      meaning1_zh: "自然温和的日常工作交流",
      meaning1_en: "Friendly daily team communication",
      trans2: "해당 기능의 내일 정식 출시가 가능한지 확인 부탁드립니다.",
      meaning2_zh: "正式商务与邮件礼貌表达",
      meaning2_en: "Formal business & email expression",
      vocab: "배포하다 (deploy) · 출시 (release)",
    },
    fr: {
      source_zh: "这个功能明天能上线吗？",
      source_en: "Can we release this feature tomorrow?",
      trans1: "On peut lancer cette fonctionnalité demain ?",
      meaning1_zh: "日常同事间轻松询问",
      meaning1_en: "Casual question to colleagues",
      trans2: "La mise en ligne de cette fonctionnalité est-elle prévue pour demain ?",
      meaning2_zh: "正式得体的书面与邮件表达",
      meaning2_en: "Formal written expression",
      vocab: "lancer (launch) · mise en ligne (release)",
    },
    de: {
      source_zh: "这个功能明天能上线吗？",
      source_en: "Can we release this feature tomorrow?",
      trans1: "Können wir das Feature morgen live schalten?",
      meaning1_zh: "日常团队直接沟通",
      meaning1_en: "Direct team chat",
      trans2: "Ist die Veröffentlichung dieser Funktion für morgen geplant?",
      meaning2_zh: "正式严谨的书面表达",
      meaning2_en: "Formal written prose",
      vocab: "live schalten (go live) · Veröffentlichung (release)",
    },
    es: {
      source_zh: "这个功能明天能上线吗？",
      source_en: "Can we release this feature tomorrow?",
      trans1: "¿Podemos lanzar esta función mañana?",
      meaning1_zh: "日常自然口语询问",
      meaning1_en: "Natural spoken question",
      trans2: "¿Está programado el lanzamiento de esta función para mañana?",
      meaning2_zh: "正式商务书面表达",
      meaning2_en: "Formal business phrasing",
      vocab: "lanzar (launch) · programado (scheduled)",
    },
    zh: {
      source_zh: "Can we ship this feature tomorrow?",
      source_en: "Can we ship this feature tomorrow?",
      trans1: "这个功能明天能发吗？",
      meaning1_zh: "自然日常群聊口语",
      meaning1_en: "Casual daily team chat",
      trans2: "请问该功能预计明天可以正式上线吗？",
      meaning2_zh: "礼貌得体的正式书面沟通",
      meaning2_en: "Polite formal workplace communication",
      vocab: "上线 (go live) · 预计 (scheduled)",
    },
  };

  function renderLiveHudPreview() {
    if (!liveHudPreview) return;
    const sample = PREVIEW_SAMPLES[activeTargetLang] || PREVIEW_SAMPLES.en;
    const isEnUI = activeLangCode === "en";
    const enabledSlots = currentSlots.filter((s) => s.enabled !== false);

    if (enabledSlots.length === 0) {
      liveHudPreview.innerHTML = `<div class="preview-row"><span class="preview-main-text" style="color:#94a3b8;">(No active rows selected)</span></div>`;
      return;
    }

    const sourceSlot = enabledSlots.find((s) => s.role === "source" || s.id === "source");
    const branchSlots = enabledSlots.filter((s) => s.role !== "source" && s.id !== "source");

    let html = "";

    if (sourceSlot) {
      html += `
        <div class="preview-row">
          <span class="preview-badge source">[${sourceSlot.label || t("default_lbl_source")}]</span>
          <span class="preview-main-text">${isEnUI ? sample.source_en : sample.source_zh}</span>
          <span class="preview-explain-pill">${t("pill_source")}</span>
        </div>
      `;
    }

    let transIdx = 0;
    branchSlots.forEach((slot, i) => {
      const isLast = i === branchSlots.length - 1;
      const treeChar = isLast ? "└" : "├";

      if (slot.role === "vocab") {
        html += `
          <div class="preview-row">
            <span class="preview-tree">${treeChar}</span>
            <span class="preview-badge vocab">[${slot.label || t("default_lbl_vocab")}]</span>
            <span class="preview-main-text" style="color:#a7f3d0;">${sample.vocab}</span>
            <span class="preview-explain-pill">${t("pill_vocab")}</span>
          </div>
        `;
      } else {
        transIdx++;
        const mainText = transIdx === 1 ? sample.trans1 : sample.trans2;
        const meaningText =
          transIdx === 1
            ? isEnUI
              ? sample.meaning1_en
              : sample.meaning1_zh
            : isEnUI
            ? sample.meaning2_en
            : sample.meaning2_zh;
        const showMeaning = slot.showMeaning !== false;

        html += `
          <div class="preview-row">
            <span class="preview-tree">${treeChar}</span>
            <span class="preview-badge">[${transIdx}] ${slot.label || t("default_lbl_single")}</span>
            <span class="preview-main-text">${mainText}</span>
            ${showMeaning ? `<span class="preview-meaning-text">(${meaningText})</span>` : ""}
            <span class="preview-explain-pill">${t("pill_pick").replace("{n}", String(transIdx))}</span>
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
      label: wantDual ? t("default_lbl_spoken") : t("default_lbl_single"),
      role: "translation",
      instruction: "Natural, fluent everyday expression.",
    };
    const secondTrans = existingTrans[1] || {
      id: "written",
      label: t("default_lbl_written"),
      role: "translation",
      instruction: "Clear, polite, formal written expression.",
    };

    const nextSlots = [];
    if (wantSource) {
      nextSlots.push({ id: "source", label: t("default_lbl_source"), role: "source", enabled: true });
    }

    nextSlots.push({
      ...firstTrans,
      label: wantDual ? t("default_lbl_spoken") : t("default_lbl_single"),
      showMeaning: wantMeaning,
      enabled: true,
    });

    if (wantDual) {
      nextSlots.push({
        ...secondTrans,
        label: t("default_lbl_written"),
        showMeaning: wantMeaning,
        enabled: true,
      });
    }

    if (wantVocab) {
      nextSlots.push({
        id: "vocab",
        label: t("default_lbl_vocab"),
        role: "vocab",
        instruction: "Extract 2-3 useful idiomatic words or phrases.",
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
      btnAiTune.textContent = "⏳ ...";
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
          aiTuneFeedback.textContent = `✅ ${res.summary}`;
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
      card.className = `slot-card ${slot.enabled !== false ? "" : "disabled"}`;

      const isSource = slot.role === "source";
      const isVocab = slot.role === "vocab";
      const hasNuance = !isSource && !isVocab;

      card.innerHTML = `
        <div class="slot-card-header">
          <span class="slot-idx-badge">#${idx + 1}</span>
          <input type="checkbox" class="slot-checkbox" ${slot.enabled !== false ? "checked" : ""} />
          <input type="text" class="slot-input-label" value="${slot.label || ""}" placeholder="Label" />
          <select class="slot-select-role">
            <option value="translation" ${slot.role === "translation" || slot.role === "custom" ? "selected" : ""}>Translation</option>
            <option value="vocab" ${slot.role === "vocab" ? "selected" : ""}>Vocab</option>
            <option value="source" ${slot.role === "source" ? "selected" : ""}>Source</option>
          </select>
          ${hasNuance ? `
            <label class="slot-nuance-toggle">
              <input type="checkbox" class="nuance-check" ${slot.showMeaning !== false ? "checked" : ""} />
              <span>Nuance</span>
            </label>
          ` : ""}
          <button type="button" class="btn-delete-slot" title="Delete">✕</button>
        </div>
        ${!isSource ? `
          <input type="text" class="slot-input-instruction" value="${slot.instruction || ""}" placeholder="Style / Prompt instruction..." />
        ` : ""}
      `;

      card.querySelector(".slot-checkbox").addEventListener("change", (e) => {
        slot.enabled = e.target.checked;
        card.classList.toggle("disabled", !slot.enabled);
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        autoSaveNow();
      });

      card.querySelector(".slot-input-label").addEventListener("input", (e) => {
        slot.label = e.target.value.trim();
        renderLiveHudPreview();
        autoSaveNow();
      });

      card.querySelector(".slot-select-role").addEventListener("change", (e) => {
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

      const inputInst = card.querySelector(".slot-input-instruction");
      if (inputInst) {
        inputInst.addEventListener("input", (e) => {
          slot.instruction = e.target.value;
          autoSaveNow();
        });
      }

      card.querySelector(".btn-delete-slot").addEventListener("click", () => {
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
        label: t("default_lbl_single"),
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
      currentSlots = getDefaultFriendlySlots();
      syncSimpleTogglesFromSlots();
      renderLiveHudPreview();
      renderSlotCards();
      autoSaveNow();
    });
  }

  // 5. Tab 3: Translation Engine
  const engineModeCards = document.querySelectorAll("#engine-mode-list .engine-mode-card");
  const cloudConfigBox = document.getElementById("cloud-config-box");
  const btnDetectLocal = document.getElementById("btn-detect-local");
  const localDetectStatus = document.getElementById("local-detect-status");

  const modelPresetChips = document.querySelectorAll("#model-preset-chips .chip");
  const inputEndpoint = document.getElementById("input-endpoint");
  const inputApiKey = document.getElementById("input-apikey");
  const inputModel = document.getElementById("input-model");
  const btnToggleKey = document.getElementById("btn-toggle-key");
  const btnTestConnection = document.getElementById("btn-test-connection");
  const testStatus = document.getElementById("test-status");
  const testStatusText = document.getElementById("test-status-text");

  const MODEL_PRESETS = {
    deepseek: {
      endpoint: "https://api.deepseek.com/v1/chat/completions",
      model: "deepseek-chat",
    },
    siliconflow: {
      endpoint: "https://api.siliconflow.cn/v1/chat/completions",
      model: "Qwen/Qwen2.5-7B-Instruct",
    },
    groq: {
      endpoint: "https://api.groq.com/openai/v1/chat/completions",
      model: "llama-3.3-70b-versatile",
    },
    openai: {
      endpoint: "https://api.openai.com/v1/chat/completions",
      model: "gpt-4o-mini",
    },
  };

  let activeEngineMode = "cloud";

  function setEngineModeUI(mode) {
    activeEngineMode = mode;
    engineModeCards.forEach((card) => {
      card.classList.toggle("active", card.dataset.emode === mode);
    });
    if (cloudConfigBox) {
      cloudConfigBox.style.display = mode === "cloud" ? "block" : "none";
    }
  }

  engineModeCards.forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("input, button, details, summary")) return;
      const mode = card.dataset.emode;
      setEngineModeUI(mode);

      if (mode === "free") {
        inputEndpoint.value = "http://127.0.0.1:0/free";
        inputApiKey.value = "";
      } else if (mode === "local") {
        inputEndpoint.value = "http://127.0.0.1:11434/v1/chat/completions";
        inputApiKey.value = "ollama";
        inputModel.value = "qwen2.5:3b";
      }
      autoSaveNow();
    });
  });

  if (btnDetectLocal) {
    btnDetectLocal.addEventListener("click", async (e) => {
      e.stopPropagation();
      setEngineModeUI("local");
      if (localDetectStatus) {
        localDetectStatus.classList.remove("hidden");
        localDetectStatus.textContent = "⏳ Scanning local ports...";
      }
      try {
        const res = await window.lingualSettingsAPI?.detectLocalAI();
        if (res && res.ollama) {
          inputEndpoint.value = "http://127.0.0.1:11434/v1/chat/completions";
          inputApiKey.value = "ollama";
          inputModel.value = inputModel.value || "qwen2.5:3b";
          if (localDetectStatus) {
            localDetectStatus.textContent = "✅ Connected to local Ollama (127.0.0.1:11434)!";
            localDetectStatus.style.color = "#15803d";
          }
          await autoSaveNow();
        } else if (res && res.lmstudio) {
          inputEndpoint.value = "http://127.0.0.1:1234/v1/chat/completions";
          inputApiKey.value = "lm-studio";
          if (localDetectStatus) {
            localDetectStatus.textContent = "✅ Connected to local LM Studio (127.0.0.1:1234)!";
            localDetectStatus.style.color = "#15803d";
          }
          await autoSaveNow();
        } else {
          if (localDetectStatus) {
            localDetectStatus.textContent = "💡 Local Ollama not running; built-in free translation will be used automatically.";
            localDetectStatus.style.color = "#b45309";
          }
        }
      } catch {
        if (localDetectStatus) {
          localDetectStatus.textContent = "💡 Built-in free translation active.";
        }
      }
    });
  }

  modelPresetChips.forEach((chip) => {
    chip.addEventListener("click", (e) => {
      e.stopPropagation();
      setEngineModeUI("cloud");
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

  if (btnToggleKey) {
    btnToggleKey.addEventListener("click", () => {
      if (inputApiKey.type === "password") {
        inputApiKey.type = "text";
        btnToggleKey.textContent = t("btn_hide_key");
      } else {
        inputApiKey.type = "password";
        btnToggleKey.textContent = t("btn_show_key");
      }
    });
  }

  if (btnTestConnection) {
    btnTestConnection.addEventListener("click", async () => {
      const endpoint = inputEndpoint.value.trim();
      const apiKey = inputApiKey.value.trim();
      const model = inputModel.value.trim();

      testStatus.className = "probe-result testing";
      testStatus.classList.remove("hidden");
      testStatusText.textContent = "Testing...";

      try {
        const res = await window.lingualSettingsAPI?.testConnection({ endpoint, apiKey, model });
        if (res && res.success) {
          testStatus.className = "probe-result success";
          testStatusText.textContent = `⚡ OK (${res.latencyMs}ms)`;
          await autoSaveNow();
        } else {
          testStatus.className = "probe-result error";
          testStatusText.textContent = `${res?.error || "Failed"} (Free fallback active)`;
        }
      } catch (err) {
        testStatus.className = "probe-result error";
        testStatusText.textContent = `Error: ${err.message}`;
      }
    });
  }

  // 6. Instant Auto-Save & Window Controls
  const btnClose = document.getElementById("btn-window-close");
  const btnCancel = document.getElementById("btn-cancel");
  const btnSave = document.getElementById("btn-save");
  const saveStatus = document.getElementById("save-status");

  async function autoSaveNow() {
    if (isInitialLoading) return;
    const patch = {
      mode: activeCompanionMode,
      sourceLang: activeLangCode,
      targetLang: activeTargetLang,
      endpoint: inputEndpoint ? inputEndpoint.value.trim() : "",
      apiKey: inputApiKey ? inputApiKey.value.trim() : "",
      model: inputModel ? inputModel.value.trim() : "",
      slotPreset: activeSlotPreset,
      slots: currentSlots,
      hotkeySubmit: selectedTriggerKey,
      autoSend: checkAutoSend ? checkAutoSend.checked : true,
    };

    try {
      await window.lingualSettingsAPI?.saveConfig(patch);
      if (saveStatus) {
        saveStatus.textContent = t("footer_saved");
      }
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  }

  btnClose?.addEventListener("click", () => window.lingualSettingsAPI?.closeWindow());
  btnCancel?.addEventListener("click", () => window.lingualSettingsAPI?.closeWindow());
  btnSave?.addEventListener("click", async () => {
    await autoSaveNow();
    window.lingualSettingsAPI?.closeWindow();
  });

  async function loadConfig() {
    isInitialLoading = true;
    try {
      const cfg = await window.lingualSettingsAPI?.getConfig();
      if (!cfg) {
        currentSlots = getDefaultFriendlySlots();
        syncSimpleTogglesFromSlots();
        renderLiveHudPreview();
        renderSlotCards();
        isInitialLoading = false;
        return;
      }

      setCompanionModeState(cfg.mode || "english");
      setLanguageState(cfg.sourceLang || "zh");
      setTargetLangState(cfg.targetLang || "en");
      setTriggerState(cfg.hotkeySubmit || "Alt+E");
      setAutoSendCardState(cfg.autoSend !== false);

      currentSlots = Array.isArray(cfg.slots) && cfg.slots.length > 0 ? cfg.slots : getDefaultFriendlySlots();
      localizeDefaultSlotLabels();
      syncSimpleTogglesFromSlots();
      renderLiveHudPreview();
      renderSlotCards();

      inputEndpoint.value = cfg.endpoint || "";
      inputApiKey.value = cfg.apiKey || "";
      inputModel.value = cfg.model || "";

      if (cfg.endpoint?.includes("127.0.0.1:0")) {
        setEngineModeUI("free");
      } else if (cfg.endpoint?.includes("11434") || cfg.endpoint?.includes("1234")) {
        setEngineModeUI("local");
      } else {
        setEngineModeUI("cloud");
      }
    } catch (e) {
      console.error("Failed to load config:", e);
    } finally {
      isInitialLoading = false;
    }
  }

  loadConfig();
})();
