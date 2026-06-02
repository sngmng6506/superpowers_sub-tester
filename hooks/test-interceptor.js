const fs = require('fs');
const readline = require('readline');
const os = require('os');

let inputData = '';
process.stdin.on('data', (chunk) => { inputData += chunk; });

process.stdin.on('end', () => {
  try {
    const event = JSON.parse(inputData);
    
    // AI가 bash 명령어를 실행하려고 할 때
    if (event.tool === 'bash' && event.arguments && event.arguments.command) {
      const command = event.arguments.command.toLowerCase();

      // 테스트 관련 키워드가 포함되어 있는지 검사
      if (command.includes('test') || command.includes('jest') || command.includes('vitest')) {
        
        // 💡 핵심: 윈도우인지 맥/리눅스인지 감지하여 터미널 경로 자동 설정
        const isWindows = os.platform() === 'win32';
        const ttyPath = isWindows ? '\\\\.\\CON' : '/dev/tty';

        const rl = readline.createInterface({
          input: fs.createReadStream(ttyPath),
          output: fs.createWriteStream(ttyPath),
          terminal: true
        });

        rl.question(`\n⚠️  [Superpowers Guard] AI가 테스트 명령어 [${command}]를 실행하려고 합니다. 승인하시겠습니까? (y/n): `, (answer) => {
          rl.close();
          
          if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
            console.error("\n✅ 테스트 실행이 승인되었습니다. 설정된 테스트 모델이 작업을 시작합니다.\n");
            process.exit(0);
          } else {
            console.error("\n❌ 사용자가 테스트 실행을 거부했습니다. 작업이 중단됩니다.\n");
            process.exit(1);
          }
        });
        
        return;
      }
    }
  } catch (e) {
    process.exit(0);
  }
  
  process.exit(0);
});
