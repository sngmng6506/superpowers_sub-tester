const fs = require('fs');
const readline = require('readline');
const path = require('path');

// 💡 아까 완성한 test-interceptor.js에서 목록 조회 및 일괄 실행 함수를 로드함
// (만약 두 파일의 경로가 다르다면 상대 경로를 맞춰주어야 함)
const { listDeferredTests, runDeferredTests } = require('./test-interceptor');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let inputData = '';
rl.on('line', (line) => { inputData += line; });

rl.on('close', () => {
  try {
    if (!inputData.trim()) {
      process.exit(0);
    }

    const event = JSON.parse(inputData);
    const prompt = event.prompt ? event.prompt.trim() : '';

    // -------------------------------------------------------------------------
    // [신규 추가 1] 미뤄진 테스트 목록 조회 명령어 (/list-deferred)
    // -------------------------------------------------------------------------
    if (prompt === '/list-deferred') {
      listDeferredTests();
      process.exit(2); // Claude 에이전트의 일반 대화 흐름을 끊고 제어권을 넘기기 위해 2로 종료
    }

    // -------------------------------------------------------------------------
    // [신규 추가 2] 미뤄진 테스트 일괄 실행 명령어 (/run-deferred)
    // -------------------------------------------------------------------------
    if (prompt === '/run-deferred') {
      runDeferredTests();
      process.exit(2); // 실행 후 세션을 깔끔하게 비우고 사용자 입력을 받기 위해 2로 종료
    }

    // -------------------------------------------------------------------------
    // [기존 로직] 테스트 모델 설정 명령어 (/set-testmodel)
    // -------------------------------------------------------------------------
    if (prompt.startsWith('/set-testmodel ')) {
      const userInput = prompt.replace('/set-testmodel ', '').trim().toLowerCase();
      
      let fullModelName = '';

      switch (userInput) {
        case 'haiku':
          fullModelName = 'claude-3-5-haiku-latest';
          break;
        case 'sonnet':
          fullModelName = 'claude-3-5-sonnet-latest';
          break;
        case 'opus':
          fullModelName = 'claude-3-opus-latest';
          break;
        default:
          if (userInput.startsWith('claude-')) {
            fullModelName = userInput;
          } else {
            console.error(`\n❌ [Superpowers] 알 수 없는 모델명입니다. (haiku, sonnet, opus 중 선택해주세요)\n`);
            process.exit(2);
          }
      }

      fs.writeFileSync('.superpowers_state.json', JSON.stringify({ current_test_model: fullModelName }));
      console.error(`\n⚙️ [Superpowers] 백그라운드 테스트 모델이 [${fullModelName}]으로 설정되었습니다.\n`);
      process.exit(2);
    }

  } catch (e) {
    process.exit(0);
  }
  
  process.exit(0);
});
