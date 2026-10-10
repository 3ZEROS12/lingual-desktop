using System;
using System.Windows.Automation;

class Program {
    [STAThread]
    static int Main(string[] args) {
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
                    Console.Write(vp.Current.Value ?? "");
                    return 0;
                }
                if (el.TryGetCurrentPattern(TextPattern.Pattern, out patternObj)) {
                    var tp = (TextPattern)patternObj;
                    Console.Write(tp.DocumentRange.GetText(-1) ?? "");
                    return 0;
                }
                Console.WriteLine("UNSUPPORTED");
                return 0;
            }

            if (cmd == "set-text") {
                string newText = args.Length > 1 ? args[1] : "";
                object patternObj;
                if (el.TryGetCurrentPattern(ValuePattern.Pattern, out patternObj)) {
                    var vp = (ValuePattern)patternObj;
                    vp.SetValue(newText);
                    Console.WriteLine("OK");
                    return 0;
                }
                Console.WriteLine("UNSUPPORTED");
                return 0;
            }

            if (cmd == "focused-rect") {
                var rect = el.Current.BoundingRectangle;
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
