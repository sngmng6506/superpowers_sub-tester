const fs = require('fs');
const readline = require('readline');

let inputData = '';
process.stdin.on('data', (chunk) => { inputData += chunk; });

process.stdin.on('end', () => {
  try {
    const event = JSON.parse(inputData);
    
    // AI가 bash 명령어를 실행하려고 할 때 가로채기
    if (event.tool === 'bash' && event.arguments && event.arguments.command) {
      const command = event.arguments.command.toLowerCase();

      // 실행하려는 명령어에 테스트 관련 키워드가 포함되어 있는지 검사
      if (command.includes('test') || command.includes('jest') || command.includes('vitest')) {
        
        // 터미널과 직접 연결하여 물리적인 사용자 입력을 받음
        // (파이프라인 환경에서도 터미널 입출력을 보장하기 위한 세팅)
        const rl = readline.createInterface({
          input: fs.createReadStream('/dev/tty'),
          output: fs.createWriteStream('/dev/tty'),
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
        
        // question 콜백 대기를 위해 여기서 return 처리
        return;
      }
    }
  } catch (e) {
    process.exit(0);
  }
  
  // 조건에 맞지 않는 명령어는 조용히 통과
  process.exit(0);
});
