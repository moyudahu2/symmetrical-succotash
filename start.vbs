Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\jyc27\Documents\New OpenCode Project\CET4-Memory-App"
WshShell.Run "cmd.exe /c set PATH=C:\Program Files\nodejs;%PATH% && npx vite --host", 0, False
