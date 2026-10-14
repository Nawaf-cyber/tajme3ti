' Runs noon-auto-task.cmd with no window (0 = hidden) and waits - called by Task Scheduler
Set sh = CreateObject("WScript.Shell")
dir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
sh.Run """" & dir & "\noon-auto-task.cmd""", 0, True
