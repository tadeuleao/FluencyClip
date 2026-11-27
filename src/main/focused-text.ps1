Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new($false)
while ($true) {
  $result = @{ available = $false; text = ''; id = '' }
  try {
    $element = [System.Windows.Automation.AutomationElement]::FocusedElement
    if ($null -ne $element -and -not $element.Current.IsPassword -and $element.Current.IsEnabled -and $element.Current.ControlType -eq [System.Windows.Automation.ControlType]::Edit) {
      $value = $null
      if ($element.TryGetCurrentPattern([System.Windows.Automation.ValuePattern]::Pattern, [ref]$value)) {
        if (-not $value.Current.IsReadOnly) {
          $result.available = $true
          $result.text = $value.Current.Value
          $result.id = ($element.GetRuntimeId() -join '.')
        }
      } else {
        $textPattern = $null
        if ($element.TryGetCurrentPattern([System.Windows.Automation.TextPattern]::Pattern, [ref]$textPattern)) {
          $result.available = $true
          $result.text = $textPattern.DocumentRange.GetText(10000)
          $result.id = ($element.GetRuntimeId() -join '.')
        }
      }
    }
  } catch { }
  [Console]::WriteLine(($result | ConvertTo-Json -Compress))
  Start-Sleep -Milliseconds 500
}
