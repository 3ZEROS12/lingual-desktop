#define WIN32_LEAN_AND_MEAN
#include <windows.h>
#include <imm.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void send_key_combination(WORD modifier_vk, WORD key_vk) {
    INPUT inputs[4];
    ZeroMemory(inputs, sizeof(inputs));

    // 1. Modifier down (e.g. VK_CONTROL)
    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wVk = modifier_vk;

    // 2. Key down (e.g. 'C' or 'V')
    inputs[1].type = INPUT_KEYBOARD;
    inputs[1].ki.wVk = key_vk;

    // 3. Key up
    inputs[2].type = INPUT_KEYBOARD;
    inputs[2].ki.wVk = key_vk;
    inputs[2].ki.dwFlags = KEYEVENTF_KEYUP;

    // 4. Modifier up
    inputs[3].type = INPUT_KEYBOARD;
    inputs[3].ki.wVk = modifier_vk;
    inputs[3].ki.dwFlags = KEYEVENTF_KEYUP;

    SendInput(4, inputs, sizeof(INPUT));
}

static void send_single_key(WORD key_vk) {
    INPUT inputs[2];
    ZeroMemory(inputs, sizeof(inputs));

    inputs[0].type = INPUT_KEYBOARD;
    inputs[0].ki.wVk = key_vk;

    inputs[1].type = INPUT_KEYBOARD;
    inputs[1].ki.wVk = key_vk;
    inputs[1].ki.dwFlags = KEYEVENTF_KEYUP;

    SendInput(2, inputs, sizeof(INPUT));
}

static void restore_focus(HWND target_hwnd) {
    if (!target_hwnd || !IsWindow(target_hwnd)) return;

    DWORD foreground_thread = GetWindowThreadProcessId(GetForegroundWindow(), NULL);
    DWORD target_thread = GetWindowThreadProcessId(target_hwnd, NULL);

    if (foreground_thread != target_thread) {
        AttachThreadInput(foreground_thread, target_thread, TRUE);
        BringWindowToTop(target_hwnd);
        SetForegroundWindow(target_hwnd);
        AttachThreadInput(foreground_thread, target_thread, FALSE);
    } else {
        BringWindowToTop(target_hwnd);
        SetForegroundWindow(target_hwnd);
    }
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        printf("Usage: win32_helper <active-window|focus <hwnd>|copy|paste|caret|ime-composing>\n");
        return 1;
    }

    const char* cmd = argv[1];

    if (strcmp(cmd, "active-window") == 0) {
        HWND hwnd = GetForegroundWindow();
        if (!hwnd) {
            hwnd = GetConsoleWindow();
        }
        if (!hwnd) {
            hwnd = GetDesktopWindow();
        }
        printf("%llu\n", (unsigned long long)hwnd);
        return 0;
    }

    if (strcmp(cmd, "focus") == 0) {
        if (argc < 3) {
            fprintf(stderr, "Missing hwnd argument\n");
            return 1;
        }
        unsigned long long hwnd_val = 0;
        if (sscanf(argv[2], "%llu", &hwnd_val) == 1) {
            restore_focus((HWND)hwnd_val);
            return 0;
        }
        return 1;
    }

    if (strcmp(cmd, "copy") == 0) {
        send_key_combination(VK_CONTROL, 'C');
        return 0;
    }

    if (strcmp(cmd, "paste") == 0) {
        send_key_combination(VK_CONTROL, 'V');
        return 0;
    }

    if (strcmp(cmd, "select-all") == 0) {
        send_key_combination(VK_CONTROL, 'A');
        return 0;
    }

    if (strcmp(cmd, "copy-all") == 0) {
        send_key_combination(VK_CONTROL, 'A');
        Sleep(25);
        send_key_combination(VK_CONTROL, 'C');
        return 0;
    }

    if (strcmp(cmd, "send-enter") == 0) {
        send_single_key(VK_RETURN);
        return 0;
    }

    if (strcmp(cmd, "caret") == 0) {
        HWND hwnd = GetForegroundWindow();
        if (hwnd) {
            DWORD thread_id = GetWindowThreadProcessId(hwnd, NULL);
            GUITHREADINFO gti;
            ZeroMemory(&gti, sizeof(gti));
            gti.cbSize = sizeof(GUITHREADINFO);

            if (GetGUIThreadInfo(thread_id, &gti) && gti.hwndCaret) {
                POINT pt;
                pt.x = gti.rcCaret.left;
                pt.y = gti.rcCaret.bottom;
                ClientToScreen(gti.hwndCaret, &pt);
                printf("%ld %ld\n", pt.x, pt.y);
                return 0;
            }
        }
        printf("none\n");
        return 0;
    }

    if (strcmp(cmd, "ime-composing") == 0) {
        HWND hwnd = GetForegroundWindow();
        if (hwnd) {
            HIMC imc = ImmGetContext(hwnd);
            if (imc) {
                LONG compLen = ImmGetCompositionStringW(imc, GCS_COMPSTR, NULL, 0);
                ImmReleaseContext(hwnd, imc);
                if (compLen > 0) {
                    printf("1\n");
                    return 0;
                }
            }
        }
        printf("0\n");
        return 0;
    }

    fprintf(stderr, "Unknown command: %s\n", cmd);
    return 1;
}
