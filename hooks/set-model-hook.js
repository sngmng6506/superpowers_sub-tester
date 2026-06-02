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
