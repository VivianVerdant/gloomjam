@echo off
IF EXIST "busybox.exe" (
	ECHO Busybox already downloaded
	GOTO runbusybox
) ELSE (
	ECHO Downloading Busybox
	curl --output busybox.exe --url https://frippery.org/files/busybox/busybox.exe
	GOTO runbusybox
)

:runbusybox
ECHO Running busybox
START ./busybox.exe httpd -fvv -h home
timeout 2
ECHO Opening index page
START "" "http://localhost/"


IF EXIST "Gloomjam Manager.exe" (
	ECHO Gloomjam Manager already downloaded
	GOTO rungm
) ELSE (
	ECHO Downloading Gloomjam Manager
	curl -L --output "gm_win.zip" --url https://github.com/VivianVerdant/gloomjam_manager/releases/latest/download/gm_win.zip
	ECHO Extracting Gloomjam Manager
	tar -xf "gm_win.zip"
	GOTO rungm
)

:rungm
ECHO running Gloomjam Manager
START ./"Gloomjam Manager.exe"