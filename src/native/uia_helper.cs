using System;
using System.Diagnostics;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading;
using System.Windows;
using System.Windows.Automation;

class Program {
    [DllImport("user32.dll")]
    static extern short GetAsyncKeyState(int vKey);

    [DllImport("user32.dll")]
    static extern IntPtr GetForegroundWindow();

    [DllImport("user32.dll")]
    static extern uint GetWindowThreadProcessId(IntPtr hWnd, out int lpdwProcessId);

    [DllImport("user32.dll", CharSet = CharSet.Unicode)]
    static extern int GetWindowTextW(IntPtr hWnd, StringBuilder lpString, int nMaxCount);

    [DllImport("imm32.dll")]
    static extern IntPtr ImmGetContext(IntPtr hWnd);

    [DllImport("imm32.dll", CharSet = CharSet.Unicode)]
    static extern int ImmGetCompositionStringW(IntPtr hIMC, uint dwIndex, byte[] lpBuf, uint dwBufLen);

    [DllImport("imm32.dll")]
    static extern bool ImmReleaseContext(IntPtr hWnd, IntPtr hIMC);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    static extern IntPtr SetWindowsHookEx(int idHook, LowLevelKeyboardProc lpfn, IntPtr hMod, uint dwThreadId);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    [return: MarshalAs(UnmanagedType.Bool)]
    static extern bool UnhookWindowsHookEx(IntPtr hhk);

    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    static extern IntPtr CallNextHookEx(IntPtr hhk, int nCode, IntPtr wParam, IntPtr lParam);

    [DllImport("kernel32.dll", CharSet = CharSet.Auto, SetLastError = true)]
    static extern IntPtr GetModuleHandle(string lpModuleName);

    [DllImport("user32.dll")]
    static extern sbyte GetMessage(out MSG lpMsg, IntPtr hWnd, uint wMsgFilterMin, uint wMsgFilterMax);

    [DllImport("user32.dll")]
    static extern bool TranslateMessage([In] ref MSG lpMsg);

    [DllImport("user32.dll")]
    static extern IntPtr DispatchMessage([In] ref MSG lpMsg);

    [StructLayout(LayoutKind.Sequential)]
    struct MSG {
        public IntPtr hwnd;
        public uint message;
        public IntPtr wParam;
        public IntPtr lParam;
        public uint time;
        public POINT pt;
    }

    [StructLayout(LayoutKind.Sequential)]
    struct POINT {
        public int x;
        public int y;
    }

    delegate IntPtr LowLevelKeyboardProc(int nCode, IntPtr wParam, IntPtr lParam);

    const int WH_KEYBOARD_LL = 13;
    const int WM_KEYDOWN = 0x0100;
    const int WM_KEYUP = 0x0101;
    const int WM_SYSKEYDOWN = 0x0104;
    const int WM_SYSKEYUP = 0x0105;

    const int VK_RETURN = 0x0D;
    const int VK_SHIFT = 0x10;
    const int VK_CONTROL = 0x11;
    const int VK_MENU = 0x12;
    const uint GCS_COMPSTR = 0x0008;

    static readonly object syncLock = new object();
    static string cachedText = "";
    static string lastEmittedDraft = "";
    static IntPtr cachedHwnd = IntPtr.Zero;
    static string cachedApp = "";
    static string cachedTitle = "";
    static Rect cachedRect = Rect.Empty;
    static long cachedTimestamp = 0;
    static long lastHeartbeatTimestamp = 0;

    static LowLevelKeyboardProc hookProc;
    static IntPtr hookId = IntPtr.Zero;

    static bool IsTerminalProcess(int pid) {
        if (pid <= 0) return false;
        try {
            var proc = Process.GetProcessById(pid);
            string name = (proc.ProcessName ?? "").ToLowerInvariant();
            return (
                name == "windowsterminal" ||
                name == "powershell" ||
                name == "pwsh" ||
                name == "cmd" ||
                name == "conhost" ||
                name == "mintty" ||
                name == "wezterm-gui" ||
                name == "alacritty" ||
                name == "openconsole"
            );
        } catch {
            return false;
        }
    }

    static bool IsLingualOwnWindow(IntPtr hwnd, int pid) {
        if (hwnd == IntPtr.Zero) return false;
        try {
            StringBuilder sb = new StringBuilder(128);
            GetWindowTextW(hwnd, sb, 128);
            string title = sb.ToString();
            if (title == "Lingual Settings" || title == "Lingual Caret Pebble" || title == "Lingual HUD") {
                return true;
            }
            if (pid > 0) {
                var proc = Process.GetProcessById(pid);
                string name = (proc.ProcessName ?? "").ToLowerInvariant();
                if (name == "lingual") return true;
            }
        } catch {}
        return false;
    }

    static bool IsImeComposingWindow(IntPtr hwnd) {
        if (hwnd == IntPtr.Zero) return false;
        try {
            IntPtr imc = ImmGetContext(hwnd);
            if (imc != IntPtr.Zero) {
                int len = ImmGetCompositionStringW(imc, GCS_COMPSTR, null, 0);
                ImmReleaseContext(hwnd, imc);
                return len > 0;
            }
        } catch {}
        return false;
    }

    static string EscapeJson(string s) {
        if (string.IsNullOrEmpty(s)) return "";
        StringBuilder sb = new StringBuilder(s.Length + 16);
        foreach (char c in s) {
            switch (c) {
                case '\\': sb.Append("\\\\"); break;
                case '"': sb.Append("\\\""); break;
                case '\r': sb.Append("\\r"); break;
                case '\n': sb.Append("\\n"); break;
                case '\t': sb.Append("\\t"); break;
                default:
                    if (c < 32) {
                        sb.AppendFormat("\\u{0:x4}", (int)c);
                    } else {
                        sb.Append(c);
                    }
                    break;
            }
        }
        return sb.ToString();
    }

    static string ReadElementTextPassive(AutomationElement el) {
        if (el == null) return null;
        try {
            object patternObj;
            if (el.TryGetCurrentPattern(ValuePattern.Pattern, out patternObj)) {
                var vp = (ValuePattern)patternObj;
                if (!vp.Current.IsReadOnly) {
                    return vp.Current.Value ?? "";
                }
                return null;
            }
            var ctrlType = el.Current.ControlType;
            bool isEditControl = (
                ctrlType == ControlType.Edit ||
                ctrlType == ControlType.ComboBox
            );
            bool isCompactDocumentInput = false;
            if (ctrlType == ControlType.Document) {
                try {
                    var r = el.Current.BoundingRectangle;
                    if (!r.IsEmpty && r.Height > 0 && r.Height < 320) {
                        isCompactDocumentInput = true;
                    }
                } catch {}
            }
            if ((isEditControl || isCompactDocumentInput) && el.TryGetCurrentPattern(TextPattern.Pattern, out patternObj)) {
                var tp = (TextPattern)patternObj;
                return tp.DocumentRange.GetText(1500) ?? "";
            }
        } catch {}
        return null;
    }

    static string GetProcessNameSafe(int pid) {
        if (pid <= 0) return "";
        try {
            var proc = Process.GetProcessById(pid);
            return (proc.ProcessName ?? "").ToLowerInvariant();
        } catch {
            return "";
        }
    }

    static string GetWindowTitleSafe(IntPtr hwnd) {
        if (hwnd == IntPtr.Zero) return "";
        try {
            StringBuilder sb = new StringBuilder(256);
            GetWindowTextW(hwnd, sb, 256);
            return sb.ToString();
        } catch {
            return "";
        }
    }

    static void SnapshotWorker() {
        int loopCount = 0;
        while (true) {
            try {
                Thread.Sleep(30);
                loopCount++;

                long now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();

                // 1. Emit periodic heartbeat every 5 seconds for health supervisor
                if (now - lastHeartbeatTimestamp > 5000) {
                    lastHeartbeatTimestamp = now;
                    Console.WriteLine(string.Format("{{\"type\":\"heartbeat\",\"timestamp\":{0}}}", now));
                    Console.Out.Flush();
                }

                IntPtr fgHwnd = GetForegroundWindow();
                if (fgHwnd == IntPtr.Zero) continue;

                int pid = 0;
                GetWindowThreadProcessId(fgHwnd, out pid);

                if (IsTerminalProcess(pid) || IsLingualOwnWindow(fgHwnd, pid)) {
                    continue;
                }

                if (IsImeComposingWindow(fgHwnd)) {
                    continue;
                }

                // Sample active draft every ~60ms
                if (loopCount % 2 == 0) {
                    var el = AutomationElement.FocusedElement;
                    if (el != null && !IsTerminalProcess(el.Current.ProcessId)) {
                        string txt = ReadElementTextPassive(el);
                        if (!string.IsNullOrWhiteSpace(txt)) {
                            string trimmed = txt.Trim();
                            if (trimmed.Length > 0 && trimmed.Length <= 2000) {
                                Rect r = Rect.Empty;
                                try {
                                    var br = el.Current.BoundingRectangle;
                                    if (!br.IsEmpty && !double.IsInfinity(br.X) && !double.IsInfinity(br.Y)) {
                                        r = br;
                                    }
                                } catch {}

                                string app = GetProcessNameSafe(pid);
                                string title = GetWindowTitleSafe(fgHwnd);

                                bool shouldEmitDraft = false;
                                lock (syncLock) {
                                    cachedText = trimmed;
                                    cachedHwnd = fgHwnd;
                                    cachedApp = app;
                                    cachedTitle = title;
                                    cachedRect = r;
                                    cachedTimestamp = now;

                                    if (trimmed != lastEmittedDraft) {
                                        lastEmittedDraft = trimmed;
                                        shouldEmitDraft = true;
                                    }
                                }

                                if (shouldEmitDraft) {
                                    int dx = r.IsEmpty ? 0 : (int)r.X;
                                    int dy = r.IsEmpty ? 0 : (int)r.Y;
                                    int dw = r.IsEmpty ? 0 : (int)r.Width;
                                    int dh = r.IsEmpty ? 0 : (int)r.Height;

                                    Console.WriteLine(string.Format(
                                        "{{\"type\":\"draft\",\"hwnd\":\"{0}\",\"app\":\"{1}\",\"title\":\"{2}\",\"x\":{3},\"y\":{4},\"w\":{5},\"h\":{6},\"text\":\"{7}\"}}",
                                        fgHwnd.ToInt64(), EscapeJson(app), EscapeJson(title), dx, dy, dw, dh, EscapeJson(trimmed)
                                    ));
                                    Console.Out.Flush();
                                }
                            }
                        }
                    }
                }
            } catch {
                // Ignore transient COM exceptions in background snapshot thread
            }
        }
    }

    static void HandleEnterTrigger(object state) {
        try {
            IntPtr fgHwnd = GetForegroundWindow();
            if (fgHwnd == IntPtr.Zero) return;

            int pid = 0;
            GetWindowThreadProcessId(fgHwnd, out pid);

            if (IsTerminalProcess(pid) || IsLingualOwnWindow(fgHwnd, pid)) {
                return;
            }

            if (IsImeComposingWindow(fgHwnd)) {
                return;
            }

            string finalDraft = "";
            Rect finalRect = Rect.Empty;
            string finalApp = GetProcessNameSafe(pid);
            string finalTitle = GetWindowTitleSafe(fgHwnd);

            // 1. Try reading input box right now (if not cleared yet by target app)
            try {
                var el = AutomationElement.FocusedElement;
                if (el != null && !IsTerminalProcess(el.Current.ProcessId)) {
                    string nowTxt = ReadElementTextPassive(el);
                    if (!string.IsNullOrWhiteSpace(nowTxt)) {
                        finalDraft = nowTxt.Trim();
                    }
                    var r = el.Current.BoundingRectangle;
                    if (!r.IsEmpty && !double.IsInfinity(r.X) && !double.IsInfinity(r.Y)) {
                        finalRect = r;
                    }
                }
            } catch {}

            // 2. If target app already cleared input box (<10ms), seamlessly fallback to our high-frequency draft snapshot!
            long nowMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            lock (syncLock) {
                if (string.IsNullOrWhiteSpace(finalDraft) && cachedHwnd == fgHwnd && (nowMs - cachedTimestamp) < 3500) {
                    finalDraft = cachedText;
                    if (finalRect.IsEmpty) {
                        finalRect = cachedRect;
                    }
                }
                cachedText = "";
                lastEmittedDraft = "";
            }

            if (!string.IsNullOrWhiteSpace(finalDraft)) {
                int rx = finalRect.IsEmpty ? 0 : (int)finalRect.X;
                int ry = finalRect.IsEmpty ? 0 : (int)finalRect.Y;
                int rw = finalRect.IsEmpty ? 0 : (int)finalRect.Width;
                int rh = finalRect.IsEmpty ? 0 : (int)finalRect.Height;

                Console.WriteLine(string.Format(
                    "{{\"type\":\"submit\",\"hwnd\":\"{0}\",\"app\":\"{1}\",\"title\":\"{2}\",\"x\":{3},\"y\":{4},\"w\":{5},\"h\":{6},\"text\":\"{7}\"}}",
                    fgHwnd.ToInt64(), EscapeJson(finalApp), EscapeJson(finalTitle), rx, ry, rw, rh, EscapeJson(finalDraft)
                ));
                Console.Out.Flush();
            }
        } catch {}
    }

    static IntPtr HookCallback(int nCode, IntPtr wParam, IntPtr lParam) {
        if (nCode >= 0) {
            int msg = (int)wParam;
            if (msg == WM_KEYDOWN || msg == WM_SYSKEYDOWN) {
                int vkCode = Marshal.ReadInt32(lParam);
                if (vkCode == VK_RETURN) {
                    bool modifierDown =
                        ((GetAsyncKeyState(VK_SHIFT) & 0x8000) != 0) ||
                        ((GetAsyncKeyState(VK_CONTROL) & 0x8000) != 0) ||
                        ((GetAsyncKeyState(VK_MENU) & 0x8000) != 0);

                    if (!modifierDown) {
                        ThreadPool.QueueUserWorkItem(HandleEnterTrigger);
                    }
                }
            }
        }
        return CallNextHookEx(hookId, nCode, wParam, lParam);
    }

    static void RunPollingFallbackWatcher() {
        bool wasEnterDown = false;
        while (true) {
            Thread.Sleep(30);
            IntPtr fgHwnd = GetForegroundWindow();
            if (fgHwnd == IntPtr.Zero) continue;
            int pid = 0;
            GetWindowThreadProcessId(fgHwnd, out pid);
            if (IsTerminalProcess(pid) || IsLingualOwnWindow(fgHwnd, pid)) {
                wasEnterDown = (GetAsyncKeyState(VK_RETURN) & 0x8000) != 0;
                continue;
            }
            bool enterDown = (GetAsyncKeyState(VK_RETURN) & 0x8000) != 0;
            bool modifierDown =
                ((GetAsyncKeyState(VK_SHIFT) & 0x8000) != 0) ||
                ((GetAsyncKeyState(VK_CONTROL) & 0x8000) != 0) ||
                ((GetAsyncKeyState(VK_MENU) & 0x8000) != 0);

            if (enterDown && !wasEnterDown && !modifierDown) {
                HandleEnterTrigger(null);
            }
            wasEnterDown = enterDown;
        }
    }

    static void RunPassiveWatcher() {
        Thread snapshotThread = new Thread(SnapshotWorker);
        snapshotThread.IsBackground = true;
        snapshotThread.Priority = ThreadPriority.BelowNormal;
        snapshotThread.Start();

        hookProc = new LowLevelKeyboardProc(HookCallback);
        using (Process curProcess = Process.GetCurrentProcess())
        using (ProcessModule curModule = curProcess.MainModule) {
            hookId = SetWindowsHookEx(WH_KEYBOARD_LL, hookProc, GetModuleHandle(curModule.ModuleName), 0);
        }

        if (hookId == IntPtr.Zero) {
            Console.Error.WriteLine("Failed to install WH_KEYBOARD_LL hook. Falling back to polling mode.");
            RunPollingFallbackWatcher();
            return;
        }

        try {
            MSG msg;
            while (GetMessage(out msg, IntPtr.Zero, 0, 0) > 0) {
                TranslateMessage(ref msg);
                DispatchMessage(ref msg);
            }
        } finally {
            if (hookId != IntPtr.Zero) {
                UnhookWindowsHookEx(hookId);
                hookId = IntPtr.Zero;
            }
        }
    }

    [STAThread]
    static int Main(string[] args) {
        Console.OutputEncoding = new UTF8Encoding(false);
        Console.InputEncoding = new UTF8Encoding(false);

        if (args.Length == 0) {
            Console.WriteLine("Usage: uia_helper <focused-text|set-text <text>|focused-rect|watch>");
            return 1;
        }

        string cmd = args[0];

        if (cmd == "watch") {
            RunPassiveWatcher();
            return 0;
        }

        try {
            var el = AutomationElement.FocusedElement;
            if (el == null) {
                Console.WriteLine("NONE");
                return 0;
            }

            if (cmd == "focused-text") {
                if (IsTerminalProcess(el.Current.ProcessId)) {
                    Console.Write("TERMINAL");
                    return 0;
                }

                object patternObj;
                if (el.TryGetCurrentPattern(ValuePattern.Pattern, out patternObj)) {
                    var vp = (ValuePattern)patternObj;
                    if (vp.Current.IsReadOnly) {
                        Console.Write("NON_EDITABLE");
                        return 0;
                    }
                    Console.Write(vp.Current.Value ?? "");
                    return 0;
                }

                var ctrlType = el.Current.ControlType;
                bool isEditableType = (
                    ctrlType == ControlType.Edit ||
                    ctrlType == ControlType.Document ||
                    ctrlType == ControlType.ComboBox
                );

                if (el.TryGetCurrentPattern(TextPattern.Pattern, out patternObj)) {
                    if (!isEditableType && !el.Current.IsKeyboardFocusable) {
                        Console.Write("NON_EDITABLE");
                        return 0;
                    }
                    var tp = (TextPattern)patternObj;
                    Console.Write(tp.DocumentRange.GetText(-1) ?? "");
                    return 0;
                }

                if (isEditableType) {
                    Console.Write("EDITABLE_FALLBACK");
                    return 0;
                }

                Console.Write("NON_EDITABLE");
                return 0;
            }

            if (cmd == "set-text") {
                string newText = args.Length > 1 ? args[1] : "";
                object patternObj;
                if (el.TryGetCurrentPattern(ValuePattern.Pattern, out patternObj)) {
                    var vp = (ValuePattern)patternObj;
                    if (!vp.Current.IsReadOnly) {
                        vp.SetValue(newText);
                        Console.WriteLine("OK");
                        return 0;
                    }
                }
                Console.WriteLine("UNSUPPORTED");
                return 0;
            }

            if (cmd == "focused-rect") {
                if (IsTerminalProcess(el.Current.ProcessId)) {
                    Console.WriteLine("NONE");
                    return 0;
                }

                var rect = el.Current.BoundingRectangle;
                if (rect.IsEmpty || double.IsInfinity(rect.X) || double.IsInfinity(rect.Y)) {
                    Console.WriteLine("NONE");
                    return 0;
                }
                Console.WriteLine(string.Format("{0} {1} {2} {3}", (int)rect.X, (int)rect.Y, (int)rect.Width, (int)rect.Height));
                return 0;
            }

            Console.WriteLine("UNKNOWN_CMD");
            return 1;
        } catch (Exception ex) {
            Console.Error.WriteLine("ERROR: " + ex.Message);
            return 1;
        }
    }
}
