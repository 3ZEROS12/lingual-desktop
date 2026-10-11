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

    const int VK_RETURN = 0x0D;
    const int VK_SHIFT = 0x10;
    const int VK_CONTROL = 0x11;
    const int VK_MENU = 0x12;
    const uint GCS_COMPSTR = 0x0008;

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

    static void RunPassiveWatcher() {
        bool wasEnterDown = false;
        int tickCount = 0;
        string cachedText = "";
        IntPtr cachedHwnd = IntPtr.Zero;
        Rect cachedRect = Rect.Empty;
        long cachedTimestamp = 0;

        while (true) {
            Thread.Sleep(40);
            tickCount++;

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

            // 1. Passive draft observation while user is typing (every ~120ms)
            if (!enterDown && (tickCount % 3 == 0)) {
                if (!IsImeComposingWindow(fgHwnd)) {
                    try {
                        var el = AutomationElement.FocusedElement;
                        if (el != null && !IsTerminalProcess(el.Current.ProcessId)) {
                            string txt = ReadElementTextPassive(el);
                            if (!string.IsNullOrWhiteSpace(txt)) {
                                string trimmed = txt.Trim();
                                if (trimmed.Length > 0 && trimmed.Length <= 1500) {
                                    cachedText = trimmed;
                                    cachedHwnd = fgHwnd;
                                    cachedTimestamp = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                                    try {
                                        var r = el.Current.BoundingRectangle;
                                        if (!r.IsEmpty && !double.IsInfinity(r.X) && !double.IsInfinity(r.Y)) {
                                            cachedRect = r;
                                        }
                                    } catch {}
                                }
                            }
                        }
                    } catch {}
                }
            }

            // 2. Passive Enter key edge detection (0ms native pass-through, NEVER blocks or hooks Enter!)
            if (enterDown && !wasEnterDown && !modifierDown) {
                if (!IsImeComposingWindow(fgHwnd)) {
                    string finalDraft = "";
                    Rect finalRect = cachedRect;

                    // Try reading right at the moment of Enter, or fall back to cached draft from 120ms ago
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

                    long nowMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
                    if (string.IsNullOrWhiteSpace(finalDraft) && cachedHwnd == fgHwnd && (nowMs - cachedTimestamp) < 4000) {
                        finalDraft = cachedText;
                    }

                    if (!string.IsNullOrWhiteSpace(finalDraft)) {
                        int rx = finalRect.IsEmpty ? 0 : (int)finalRect.X;
                        int ry = finalRect.IsEmpty ? 0 : (int)finalRect.Y;
                        int rw = finalRect.IsEmpty ? 0 : (int)finalRect.Width;
                        int rh = finalRect.IsEmpty ? 0 : (int)finalRect.Height;

                        Console.WriteLine(string.Format(
                            "{{\"type\":\"submit\",\"hwnd\":\"{0}\",\"x\":{1},\"y\":{2},\"w\":{3},\"h\":{4},\"text\":\"{5}\"}}",
                            fgHwnd.ToInt64(), rx, ry, rw, rh, EscapeJson(finalDraft)
                        ));
                        Console.Out.Flush();
                        cachedText = "";
                    }
                }
            }

            wasEnterDown = enterDown;
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
