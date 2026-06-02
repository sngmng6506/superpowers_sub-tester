const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let inputData = '';
rl.on('line', (line) => { inputData += line; });

rl.on('close', () => {
  try {
    const event = JSON.parse(inputData);
    const prompt = event.prompt.trim();

    // 1. 사용자가 입력한 명령어가 /set-testmodel로 시작하는지 검사
    if (prompt.startsWith('/set-testmodel ')) {
      const userInput = prompt.replace('/set-testmodel ', '').trim().toLowerCase();
      
      let fullModelName = '';

      // 2. 입력값에 따라 안트로픽 최신 릴리즈 버전 모델명으로 자동 매핑
      switch (userInput) {
        case 'haiku':
          fullModelName = 'claude-3-5-haiku-latest'; // 최신 3.5 하이쿠
          break;
        case 'sonnet':
          fullModelName = 'claude-3-5-sonnet-latest'; // 최신 3.5 소네트
          break;
        case 'opus':
          fullModelName = 'claude-3-opus-latest'; // 최신 오푸스
          break;
        default:
          // 사용자가 쌩 모델명을 다 적었을 경우 (예: claude-3-5-sonnet-20241022) 그대로 허용
          if (userInput.startsWith('claude-')) {
            fullModelName = userInput;
          } else {
            console.error(`\n❌ [Superpowers] 알 수 없는 모델명입니다. (haiku, sonnet, opus 중 선택해주세요)\n`);
            process.exit(2);
          }
      }

      // 3. 파일 시스템에 물리적으로 상태 저장
      fs.writeFileSync('.superpowers_state.json', JSON.stringify({ current_subagent_model: fullModelName }));

      // 4. UI 터미널 메시지 출력
      console.error(`\n⚙️ [Superpowers] 백그라운드 테스트 모델이 [${fullModelName}]으로 설정되었습니다.\n`);

      // 5. LLM(AI) 호출을 취소하고 즉시 턴 종료
      process.exit(2);
    }
  } catch (e) {
    process.exit(0);
  }
  
  // 명령어가 아니면 정상 진행
  process.exit(0);
});
