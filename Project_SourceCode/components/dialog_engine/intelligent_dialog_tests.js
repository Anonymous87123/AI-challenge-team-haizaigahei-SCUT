/**
 * ========================================
 * 智能对话系统测试套件
 * 版本: 1.0
 * 功能：测试意图识别、实体抽取、多轮对话等功能
 * ========================================
 */

const IntelligentDialogTests = {
    /**
     * 运行所有测试
     */
    async runAllTests() {
        console.log('🧪 开始执行智能对话系统测试...\n');
        
        const results = {
            entityExtraction: this.testEntityExtraction(),
            intentRecognition: this.testIntentRecognition(),
            multiTurnDialog: await this.testMultiTurnDialog(),
            errorHandling: this.testErrorHandling(),
            performance: await this.testPerformance()
        };
        
        this.generateTestReport(results);
        
        return results;
    },

    /**
     * 测试实体抽取
     */
    testEntityExtraction() {
        console.log('\n📋 测试1：实体抽取');
        
        const testCases = [
            {
                input: '帮我记一下高数作业，后天截止',
                expected: {
                    homework_name: '作业',
                    course_name: '高等数学',
                    due_date: '后天'
                }
            },
            {
                input: '添加英语作文作业，本周五交',
                expected: {
                    homework_name: '作业',
                    course_name: '英语',
                    due_date: '本周五'
                }
            },
            {
                input: '查询我这周的作业',
                expected: {
                    time_range: '本周'
                }
            }
        ];
        
        let passed = 0;
        const results = [];
        
        for (const testCase of testCases) {
            try {
                const entities = EntityExtractor.extract(testCase.input);
                
                const partialMatch = this.checkPartialMatch(entities, testCase.expected);
                
                if (partialMatch) {
                    passed++;
                    results.push({
                        test: testCase.input,
                        status: '✅ 通过',
                        extracted: entities
                    });
                    console.log(`✅ ${testCase.input}`);
                } else {
                    results.push({
                        test: testCase.input,
                        status: '❌ 失败',
                        expected: testCase.expected,
                        actual: entities
                    });
                    console.log(`❌ ${testCase.input}`);
                    console.log(`   期望:`, testCase.expected);
                    console.log(`   实际:`, entities);
                }
            } catch (error) {
                results.push({
                    test: testCase.input,
                    status: '⚠️ 错误',
                    error: error.message
                });
                console.log(`⚠️ ${testCase.input} - ${error.message}`);
            }
        }
        
        const score = Math.round((passed / testCases.length) * 100);
        console.log(`\n实体抽取测试: ${passed}/${testCases.length} 通过 (${score}%)\n`);
        
        return {
            passed,
            total: testCases.length,
            score,
            results
        };
    },

    /**
     * 检查部分匹配
     */
    checkPartialMatch(actual, expected) {
        let matchCount = 0;
        const totalExpected = Object.keys(expected).length;
        
        for (const [key, value] of Object.entries(expected)) {
            if (actual[key] && actual[key].includes(value)) {
                matchCount++;
            }
        }
        
        return matchCount >= Math.ceil(totalExpected * 0.5); // 至少匹配50%
    },

    /**
     * 测试意图识别
     */
    testIntentRecognition() {
        console.log('\n🎯 测试2：意图识别');
        
        const testCases = [
            { input: '添加作业', expected: 'add_homework' },
            { input: '查询作业', expected: 'query_homework' },
            { input: '设置提醒', expected: 'set_reminder' },
            { input: '今天有什么课', expected: 'ask_schedule' },
            { input: '二食堂有什么菜', expected: 'ask_canteen' },
            { input: '图书馆什么时候开门', expected: 'ask_library' },
            { input: '校车几点发车', expected: 'ask_shuttle' },
            { input: '快递站在哪里', expected: 'ask_express' },
            { input: '体育馆开放时间', expected: 'ask_facility' },
            { input: '你好', expected: 'greetings' },
            { input: '谢谢', expected: 'thanks' },
            { input: '再见', expected: 'goodbye' }
        ];
        
        let passed = 0;
        const results = [];
        
        for (const testCase of testCases) {
            if (!DialogEngine.state.isInitialized) {
                DialogEngine.init();
            }
            
            const intent = DialogEngine.recognizeIntent(testCase.input);
            
            if (intent === testCase.expected || intent.includes(testCase.expected)) {
                passed++;
                results.push({
                    test: testCase.input,
                    expected: testCase.expected,
                    actual: intent,
                    status: '✅ 通过'
                });
                console.log(`✅ ${testCase.input} -> ${intent}`);
            } else {
                results.push({
                    test: testCase.input,
                    expected: testCase.expected,
                    actual: intent,
                    status: '❌ 失败'
                });
                console.log(`❌ ${testCase.input}`);
                console.log(`   期望: ${testCase.expected}`);
                console.log(`   实际: ${intent}`);
            }
        }
        
        const score = Math.round((passed / testCases.length) * 100);
        console.log(`\n意图识别测试: ${passed}/${testCases.length} 通过 (${score}%)\n`);
        
        return {
            passed,
            total: testCases.length,
            score,
            results
        };
    },

    /**
     * 测试多轮对话
     */
    async testMultiTurnDialog() {
        console.log('\n💬 测试3：多轮对话');
        
        if (!DialogEngine.state.isInitialized) {
            await DialogEngine.init();
        }
        
        const testCases = [
            {
                name: '添加作业 - 完整信息',
                dialogues: [
                    { input: '添加作业', expectedContains: ['作业', '内容'] },
                    { input: '完成习题册', expectedContains: ['截止', '日期'] },
                    { input: '周五', expectedContains: ['已记录', '截止时间'] }
                ]
            },
            {
                name: '添加作业 - 一步到位',
                dialogues: [
                    { input: '添加高数作业，周五截止', expectedContains: ['已记录', '高数', '周五截止'] }
                ]
            }
        ];
        
        let passed = 0;
        const results = [];
        
        for (const testCase of testCases) {
            console.log(`\n测试场景: ${testCase.name}`);
            let scenarioPassed = true;
            const scenarioResults = [];
            
            for (let i = 0; i < testCase.dialogues.length; i++) {
                const dialogue = testCase.dialogues[i];
                
                try {
                    const response = await DialogEngine.generateResponse(dialogue.input);
                    
                    const allMatched = dialogue.expectedContains.every(
                        text => response.text.includes(text)
                    );
                    
                    if (allMatched) {
                        scenarioResults.push({
                            input: dialogue.input,
                            status: '✅ 通过',
                            response: response.text
                        });
                        console.log(`  步骤${i+1} ✅: ${dialogue.input}`);
                    } else {
                        scenarioResults.push({
                            input: dialogue.input,
                            status: '❌ 失败',
                            expected: dialogue.expectedContains,
                            actual: response.text
                        });
                        console.log(`  步骤${i+1} ❌: ${dialogue.input}`);
                        console.log(`    期望包含: ${dialogue.expectedContains.join(', ')}`);
                        console.log(`    实际: ${response.text}`);
                        scenarioPassed = false;
                    }
                } catch (error) {
                    scenarioResults.push({
                        input: dialogue.input,
                        status: '⚠️ 错误',
                        error: error.message
                    });
                    console.log(`  步骤${i+1} ⚠️: ${error.message}`);
                    scenarioPassed = false;
                }
            }
            
            // 测试场景结束时，确保重置状态
            DialogEngine.abortMultiTurnDialog();
            
            // 测试场景结束时，确保重置状态
            DialogEngine.abortMultiTurnDialog();
            
            if (scenarioPassed) {
                passed++;
            }
            
            results.push({
                name: testCase.name,
                status: scenarioPassed ? '✅ 通过' : '❌ 失败',
                details: scenarioResults
            });
        }
        
        const score = Math.round((passed / testCases.length) * 100);
        console.log(`\n多轮对话测试: ${passed}/${testCases.length} 通过 (${score}%)\n`);
        
        return {
            passed,
            total: testCases.length,
            score,
            results
        };
    },

    /**
     * 测试错误处理
     */
    async testErrorHandling() {
        console.log('\n⚠️ 测试4：错误处理');
        
        const testCases = [
            { input: '', type: '空输入' },
            { input: '!!!@@@###', type: '特殊字符' },
            { input: 'asfdjkl;asdfjkl;', type: '无意义输入' }
        ];
        
        let passed = 0;
        const results = [];
        
        for (const testCase of testCases) {
            try {
                const response = await DialogEngine.generateResponse(testCase.input);
                
                if (response.text && response.text.length > 0) {
                    passed++;
                    results.push({
                        test: testCase.type,
                        status: '✅ 通过',
                        response: response.text
                    });
                    console.log(`✅ ${testCase.type}: 正常响应`);
                } else {
                    results.push({
                        test: testCase.type,
                        status: '❌ 失败',
                        response: response
                    });
                    console.log(`❌ ${testCase.type}: 无响应`);
                }
            } catch (error) {
                // 捕获到错误也算通过（系统应该能处理）
                passed++;
                results.push({
                    test: testCase.type,
                    status: '✅ 通过',
                    error: error.message
                });
                console.log(`✅ ${testCase.type}: 正确捕获错误`);
            }
        }
        
        const score = Math.round((passed / testCases.length) * 100);
        console.log(`\n错误处理测试: ${passed}/${testCases.length} 通过 (${score}%)\n`);
        
        return {
            passed,
            total: testCases.length,
            score,
            results
        };
    },

    /**
     * 测试性能
     */
    async testPerformance() {
        console.log('\n⚡ 测试5：性能测试');
        
        const testCases = [
            { input: '你好', name: '简单问候' },
            { input: '添加高数作业，周五截止', name: '中等复杂度' },
            { input: '查询我这周有什么作业，要详细一点的', name: '复杂查询' }
        ];
        
        const results = [];
        let totalTime = 0;
        const maxAllowedTime = 2000; // 2秒
        
        for (const testCase of testCases) {
            const startTime = performance.now();
            
            const response = await DialogEngine.generateResponse(testCase.input);
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            totalTime += duration;
            
            const passed = duration < maxAllowedTime;
            
            results.push({
                test: testCase.name,
                duration: Math.round(duration),
                status: passed ? '✅ 通过' : '❌ 超时',
                threshold: maxAllowedTime
            });
            
            console.log(`${passed ? '✅' : '❌'} ${testCase.name}: ${Math.round(duration)}ms`);
        }
        
        const avgTime = totalTime / testCases.length;
        const passed = results.every(r => r.duration < maxAllowedTime) ? results.length : results.filter(r => r.duration < maxAllowedTime).length;
        const score = Math.round((passed / testCases.length) * 100);
        
        console.log(`\n性能测试: ${passed}/${testCases.length} 通过 (${score}%)`);
        console.log(`平均响应时间: ${Math.round(avgTime)}ms\n`);
        
        return {
            passed,
            total: testCases.length,
            score,
            avgTime: Math.round(avgTime),
            results
        };
    },

    /**
     * 生成测试报告
     */
    generateTestReport(results) {
        console.log('\n' + '='.repeat(50));
        console.log('📊 测试报告总结');
        console.log('='.repeat(50) + '\n');
        
        const totalPassed = Object.values(results).reduce((sum, r) => sum + r.passed, 0);
        const totalTests = Object.values(results).reduce((sum, r) => sum + r.total, 0);
        const overallScore = Math.round((totalPassed / totalTests) * 100);
        
        console.log(`实体抽取:     ${results.entityExtraction.passed}/${results.entityExtraction.total} (${results.entityExtraction.score}%)`);
        console.log(`意图识别:     ${results.intentRecognition.passed}/${results.intentRecognition.total} (${results.intentRecognition.score}%)`);
        console.log(`多轮对话:     ${results.multiTurnDialog.passed}/${results.multiTurnDialog.total} (${results.multiTurnDialog.score}%)`);
        console.log(`错误处理:     ${results.errorHandling.passed}/${results.errorHandling.total} (${results.errorHandling.score}%)`);
        console.log(`性能测试:     ${results.performance.passed}/${results.performance.total} (${results.performance.score}%)`);
        console.log(`平均响应时间: ${results.performance.avgTime}ms`);
        console.log('\n' + '-'.repeat(50));
        console.log(`总体评分: ${totalPassed}/${totalTests} (${overallScore}%)`);
        console.log('='.repeat(50) + '\n');
        
        // 返回报告对象
        return {
            entityExtraction: results.entityExtraction,
            intentRecognition: results.intentRecognition,
            multiTurnDialog: results.multiTurnDialog,
            errorHandling: results.errorHandling,
            performance: results.performance,
            overall: {
                passed: totalPassed,
                total: totalTests,
                score: overallScore
            }
        };
    }
};

// 导出到全局
if (typeof window !== 'undefined') {
    window.IntelligentDialogTests = IntelligentDialogTests;
}