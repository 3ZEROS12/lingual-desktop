using System;
using System.Text;
using System.Windows.Automation;

class Program {
    [STAThread]
    static int Main(string[] args) {
        Console.OutputEncoding = new UTF8Encoding(false);
        Console.InputEncoding = new UTF8Encoding(false);

        if (args.Length == 0) {
            Console.WriteLine("Usage: uia_helper <focused-text|set-text <text>|focused-rect>");
            return 1;
        }

        try {
            var el = AutomationElement.FocusedElement;
            if (el == null) {
                Console.WriteLine("NONE");
                return 0;
            }

            string cmd = args[0];

            if (cmd == "focused-text") {
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
