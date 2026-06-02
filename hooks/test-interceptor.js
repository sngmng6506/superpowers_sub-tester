const fs = require('fs');
const path = require('path');
const readline = require('readline');
const os = require('os');
const { execSync } = require('child_process');

const DEFERRED_FILE = path.join(process.cwd(), '.deferred_tests.txt');

// -----------------------------------------------------------------------------
// [파트 1] 미뤄진 테스트 관리 코어 함수들 (외부 exports용)
// -----------------------------------------------------------------------------

// 1. 'n' 선택 시 또는 취소 시 테스트 명령어를 파일에 기록하는 로직
function deferTestCommand(command) {
    try {
        const trimmedCmd = command.trim();
        let existingTests = [];
        if (fs.existsSync(DEFERRED_FILE)) {
            existingTests = fs.readFileSync(DEFERRED_FILE, 'utf8')
                .split('\n')
                .map(line => line.trim())
                .filter(Boolean);
        }
        
        // 중복 등록 방지
        if (!existingTests.includes(trimmedCmd)) {
            fs.appendFileSync(DEFERRED_FILE, trimmedCmd + '\n', 'utf8');
        }
        console.error(`\n🛑 테스트 실행이 취소되었으며, 일괄 수행을 위해 목록에 저장되었습니다.`);
        console.error(`📂 저장 위치: .deferred_tests.txt\n`);
    } catch (err) {
        console.error(`❌ 테스트 예약 중 오류 발생: ${err.message}`);
    }
}

// 2. 목록 확인 기능 (/list-deferred 연결용)
function listDeferredTests() {
    if (!fs.existsSync(DEFERRED_FILE) || fs.readFileSync(DEFERRED_FILE, 'utf8').trim() === '') {
        console.log('\n✅ 현재 미뤄진 테스트가 없습니다. 깔끔한 상태입니다.');
        return;
    }
    const lines = fs.readFileSync(DEFERRED_FILE, 'utf8').trim().split('\n').filter(Boolean);
    console.log('\n📋 [미뤄진 테스트 목록]');
    lines.forEach((cmd, idx) => console.log(`  ${idx + 1}. ${cmd}`));
    console.log(`\n💡 팁: '/run-deferred'를 입력하면 위 목록을 일괄 실행함.`);
}

// 3. 일괄 실행 기능 (/run-deferred 연결용)
function runDeferredTests() {
    if (!fs.existsSync(DEFERRED_FILE) || fs.readFileSync(DEFERRED_FILE, 'utf8').trim() === '') {
        console.log('\n❌ 일괄 실행할 미뤄진 테스트가 없습니다.');
        return;
    }
    const lines = fs.readFileSync(DEFERRED_FILE, 'utf8').trim().split('\n').filter(Boolean);
    console.log(`\n🚀 총 ${lines.length}개의 미뤄진 테스트를 일괄 실행합니다...`);
    
    let successCount = 0;
    let failCount = 0;

    lines.forEach((cmd) => {
        try {
            console.log(`\n🏃 실행 중: ${cmd}`);
            // 실시간 터미널 출력을 위해 stdio: 'inherit' 사용
            execSync(cmd, { stdio: 'inherit' });
            successCount++;
        } catch (err) {
            console.log(`❌ 테스트 실패: ${cmd}`);
            failCount++;
        }
    });

    // 실행 완료 후 파일 초기화
    fs.writeFileSync(DEFERRED_FILE, '', 'utf8');
    console.log(`\n✨ 모든 미뤄진 테스트 일괄 수행 완료! (성공: ${successCount}, 실패: ${failCount})`);
    console.log('🧹 미뤄진 테스트 목록이 초기화되었습니다.');
}


// -----------------------------------------------------------------------------
// [파트 2] Claude Code 프로세스 스트림 가로채기 훅 (실시간 런타임 제어)
// -----------------------------------------------------------------------------

let inputData = '';
process.stdin.on('data', (chunk) => { inputData += chunk; });

process.stdin.on('end', () => {
    try {
        if (!inputData.trim()) {
            process.exit(0);
        }

        const event = JSON.parse(inputData);
        
        // AI가 bash 명령어를 실행하려고 할 때 인터셉트
        if (event.tool === 'bash' && event.arguments && event.arguments.command) {
            const command = event.arguments.command; // 원본 명령어 유지
            const lowerCommand = command.toLowerCase();

            // 테스트 관련 키워드가 포함되어 있는지 검사
            if (lowerCommand.includes('test') || lowerCommand.includes('jest') || lowerCommand.includes('vitest')) {
                
                const isWindows = os.platform() === 'win32';
                const ttyPath = isWindows ? '\\\\.\\CON' : '/dev/tty';

                const rl = readline.createInterface({
                    input: fs.createReadStream(ttyPath),
                    output: fs.createWriteStream(ttyPath),
                    terminal: true
                });

                rl.question(`\n⚠️  [Superpowers Guard] AI가 테스트 명령어 [${command}]를 실행하려고 합니다. 승인하시겠습니까? (y/n): `, (answer) => {
                    rl.close();
                    
                    const normalizedAnswer = answer.toLowerCase().trim();
                    if (normalizedAnswer === 'y' || normalizedAnswer === 'yes') {
                        console.error("\n✅ 테스트 실행이 승인되었습니다. 설정된 테스트 모델이 작업을 시작합니다.\n");
                        process.exit(0); // 0을 반환하여 원래 스크립트(테스트 구동) 계속 진행
                    } else {
                        // 💡 핵심 수정: 'n' 선택 시 거부 메시지 출력 전 파일을 누적 기록함
                        deferTestCommand(command); 
                        process.exit(1); // 1을 반환하여 Claude Code의 무단 실행 프로세스 차단
                    }
                });
                
                return;
            }
        }
    } catch (e) {
        // JSON 파싱 실패 등 예외 발생 시 안전하게 에이전트 원래 흐름 유지
        process.exit(0);
    }
    
    process.exit(0);
});

// 외부 명령어 핸들러 파일(commands.js 등)에서 사용할 수 있도록 내보냄
module.exports = {
    listDeferredTests,
    runDeferredTests
};
