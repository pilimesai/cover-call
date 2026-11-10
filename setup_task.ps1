$pythonPath = "C:\Users\User\AppData\Local\Python\pythoncore-3.14-64\python.exe"
$scriptPath = "d:\vibe code\cover call\generate_data.py"
$workDir    = "d:\vibe code\cover call"

$cmdArgs = "-NoProfile -WindowStyle Hidden -Command `"Set-Location '$workDir'; git pull --rebase origin main; & '$pythonPath' '$scriptPath'; git add data/data.json; if ((git status --porcelain data/data.json)) { git commit -m 'chore: auto-update historical data'; git push origin main }`""

$action = New-ScheduledTaskAction `
    -Execute "powershell.exe" `
    -Argument $cmdArgs `
    -WorkingDirectory $workDir

$trigger = New-ScheduledTaskTrigger -Daily -At "15:30"

$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Minutes 10) `
    -StartWhenAvailable `
    -RunOnlyIfNetworkAvailable

Register-ScheduledTask `
    -TaskName "CoverCall_UpdateData" `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Description "Auto update Cover Call backtest data after TW stock market close" `
    -Force

Write-Host "Task registered successfully. Runs daily at 14:00."
