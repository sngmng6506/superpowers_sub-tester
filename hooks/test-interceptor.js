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



const fs = require('fs');
const path = require('path');
const DEFERRED_FILE = path.join(process.cwd(), '.deferred_tests.txt');

// 1. 'n'을 선택했을 때 파일에 저장하는 로직
function deferTestCommand(command) {
    // 중복 등록 방지를 원한다면 체크 로직 추가 가능
    fs.appendFileSync(DEFERRED_FILE, command + '\n', 'utf8');
    console.log(`\n⚠️ 테스트 실행이 취소되었으며, 일괄 수행을 위해 목록에 저장되었습니다.`);
    console.log(`📂 저장 위치: .deferred_tests.txt`);
}

// 2. 목록 확인 기능 (/list-deferred)
function listDeferredTests() {
    if (!fs.existsSync(DEFERRED_FILE) || fs.readFileSync(DEFERRED_FILE, 'utf8').trim() === '') {
        console.log('\n✅ 현재 미뤄진 테스트가 없습니다. 깔끔한 상태입니다.');
        return;
    }
    const lines = fs.readFileSync(DEFERRED_FILE, 'utf8').trim().split('\n');
    console.log('\n📋 [미뤄진 테스트 목록]');
    lines.forEach((cmd, idx) => console.log(`${idx + 1}. ${cmd}`));
}

// 3. 일괄 실행 기능 (/run-deferred)
function runDeferredTests() {
    if (!fs.existsSync(DEFERRED_FILE) || fs.readFileSync(DEFERRED_FILE, 'utf8').trim() === '') {
        console.log('\n❌ 일괄 실행할 미뤄진 테스트가 없습니다.');
        return;
    }
    const lines = fs.readFileSync(DEFERRED_FILE, 'utf8').trim().split('\n');
    console.log(`\n🚀 총 ${lines.length}개의 미뤄진 테스트를 일괄 실행합니다...`);
    
    // 차례대로 동기 실행 (execSync 등을 활용)
    const { execSync } = require('child_process');
    lines.forEach((cmd) => {
        try {
            console.log(`\n🏃 실행 중: ${cmd}`);
            execSync(cmd, { stdio: 'inherit' });
        } catch (err) {
            console.log(`❌ 테스트 실패: ${cmd}`);
        }
    });

    // 실행 완료 후 파일 초기화
    fs.writeFileSync(DEFERRED_FILE, '', 'utf8');
    console.log('\n✨ 모든 미뤄진 테스트 일괄 수행 완료 및 목록 초기화됨.');
}
