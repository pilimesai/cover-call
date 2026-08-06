$pythonPath = "C:\Users\User\AppData\Local\Python\pythoncore-3.14-64\python.exe"
$scriptPath = "d:\vibe code\cover call\generate_data.py"
$workDir    = "d:\vibe code\cover call"

$action = New-ScheduledTaskAction `
    -Execute $pythonPath `
    -Argument "`"$scriptPath`"" `
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
