// Generates diverse multi-scenario examples for all CET-4 words
// Run: node scripts/generate-diverse-examples.cjs > src/data/words.js

const fs = require('fs')
const path = require('path')

// ── Sentence pattern templates organized by POS × scenario ──
// {W} = word, {D} = definition fragment

const patterns = {
  verb: {
    daily: [
      { t: "I need to {W} this before the deadline tomorrow.", cn: "我需要在明天的截止日期之前{W}这个。", tone: "neutral" },
      { t: "Can you help me {W} this task? It's driving me crazy.", cn: "你能帮我{W}这个任务吗？快把我逼疯了。", tone: "humorous" },
      { t: "She always finds a way to {W} things around here.", cn: "她总有办法在这里{W}事情。", tone: "neutral" },
      { t: "Don't forget to {W} the documents before the meeting.", cn: "别忘了在开会前{W}文件。", tone: "neutral" },
      { t: "He managed to {W} the situation like a true professional.", cn: "他像个真正的专业人士一样{W}了局面。", tone: "formal" },
      { t: "I tried to {W} the problem but it was too complicated.", cn: "我试着{W}这个问题，但它太复杂了。", tone: "neutral" },
      { t: "My mom asked me to {W} the house before guests arrive.", cn: "我妈让我在客人来之前{W}房子。", tone: "humorous" },
      { t: "We need to {W} this issue before it gets worse.", cn: "我们需要在情况恶化之前{W}这个问题。", tone: "neutral" },
      { t: "The kids love to {W} their grandparents when they visit.", cn: "孩子们喜欢在祖父母来访时{W}他们。", tone: "neutral" },
      { t: "I can't believe he tried to {W} his way out of trouble!", cn: "我真不敢相信他试图{W}来摆脱麻烦！", tone: "slang" },
      { t: "Let me {W} the main points so everyone understands.", cn: "让我{W}一下要点，大家就都明白了。", tone: "neutral" },
      { t: "She knows how to {W} the best out of every situation.", cn: "她知道如何在每种情况下{W}出最好的结果。", tone: "neutral" },
      { t: "Stop trying to {W} me — I know what you're up to!", cn: "别想{W}我——我知道你想干什么！", tone: "humorous" },
      { t: "The coach told us to {W} harder if we want to win.", cn: "教练告诉我们如果想赢就要更努力地{W}。", tone: "neutral" },
      { t: "I usually {W} my notes after class to remember better.", cn: "我通常课后{W}笔记以便更好地记忆。", tone: "neutral" },
    ],
    news: [
      { t: "The committee voted to {W} the new policy next quarter.", cn: "委员会投票决定在下个季度{W}新政策。", tone: "formal" },
      { t: "Authorities continue to {W} the region for safety concerns.", cn: "出于安全考虑，当局继续对该地区进行{W}。", tone: "formal" },
      { t: "The report {W}s a significant shift in consumer behavior.", cn: "报告{W}了消费者行为的重大变化。", tone: "formal" },
      { t: "Officials {W}ed their commitment to climate action.", cn: "官员们{W}了他们对气候行动的承诺。", tone: "formal" },
      { t: "The government plans to {W} stricter regulations.", cn: "政府计划{W}更严格的规定。", tone: "formal" },
      { t: "Experts {W} that the trend will continue through next year.", cn: "专家们{W}这一趋势将持续到明年。", tone: "formal" },
      { t: "The new law {W}s all citizens equally under the system.", cn: "新法律在该制度下平等地{W}所有公民。", tone: "formal" },
      { t: "Researchers {W}ed the data and published their findings.", cn: "研究人员{W}了数据并发表了他们的发现。", tone: "formal" },
      { t: "The agreement {W}s a milestone in bilateral relations.", cn: "该协议{W}了双边关系的一个里程碑。", tone: "formal" },
      { t: "The organization {W}s aid to affected communities.", cn: "该组织向受灾社区{W}援助。", tone: "formal" },
      { t: "The summit {W}ed discussions on global trade reform.", cn: "峰会{W}了关于全球贸易改革的讨论。", tone: "formal" },
      { t: "The court ruling {W}ed a precedent for future cases.", cn: "法院裁决为未来案件{W}了先例。", tone: "formal" },
      { t: "The committee will {W} the proposal in next week's session.", cn: "委员会将在下周的会议上{W}该提案。", tone: "formal" },
      { t: "Officials {W} the new strategy as a major breakthrough.", cn: "官员们将新战略{W}为重大突破。", tone: "formal" },
      { t: "The investigation {W}s multiple violations of protocol.", cn: "调查{W}了多起违反协议的行为。", tone: "formal" },
    ],
    academic: [
      { t: "In your essay, you should {W} your argument with evidence.", cn: "在文章中，你应该用证据来{W}你的论点。", tone: "formal" },
      { t: "The experiment aims to {W} the hypothesis under controlled conditions.", cn: "该实验旨在受控条件下{W}该假设。", tone: "formal" },
      { t: "Scholars often {W} this period as a turning point in history.", cn: "学者们常将这一时期{W}为历史的转折点。", tone: "formal" },
      { t: "The study {W}s a strong correlation between diet and health.", cn: "该研究{W}了饮食与健康之间的强相关性。", tone: "formal" },
      { t: "To {W} the difference, examine both cases carefully.", cn: "要{W}其中的差异，请仔细检查两个案例。", tone: "neutral" },
      { t: "The theory {W}s complex ideas into simple, testable models.", cn: "该理论将复杂的概念{W}为简单可检验的模型。", tone: "formal" },
      { t: "CET-4 often tests whether students can {W} the main idea.", cn: "大学英语四级考试常测试学生是否能{W}主旨大意。", tone: "neutral" },
      { t: "The research paper {W}s several important social trends.", cn: "该研究论文{W}了几个重要的社会趋势。", tone: "formal" },
      { t: "This formula {W}s the relationship between force and motion.", cn: "这个公式{W}了力与运动之间的关系。", tone: "formal" },
      { t: "It is essential to {W} the data before drawing conclusions.", cn: "在得出结论之前，必须对数据{W}。", tone: "formal" },
      { t: "The analysis {W}s three distinct patterns in the results.", cn: "该分析在结果中{W}了三种不同的模式。", tone: "formal" },
      { t: "Students must learn to {W} credible sources from unreliable ones.", cn: "学生必须学会从不可靠来源中{W}出可靠来源。", tone: "neutral" },
      { t: "The curriculum {W}s both theoretical and practical knowledge.", cn: "该课程{W}了理论和实践知识。", tone: "formal" },
      { t: "This chapter {W}s the key concepts from the previous section.", cn: "本章{W}了前一节的关键概念。", tone: "formal" },
      { t: "The professor asked us to {W} the text closely for hidden meaning.", cn: "教授要求我们仔细{W}文本以寻找隐含意义。", tone: "neutral" },
    ],
  },
  noun: {
    daily: [
      { t: "That's a really nice {W} you've got there!", cn: "你那个{W}真不错！", tone: "neutral" },
      { t: "I left my {W} at home — what a terrible day!", cn: "我把{W}忘在家里了——今天真倒霉！", tone: "humorous" },
      { t: "There's a {W} on the table that needs your attention.", cn: "桌子上有一个{W}需要你处理。", tone: "neutral" },
      { t: "The {W} of this place is really impressive.", cn: "这个地方的{W}真令人印象深刻。", tone: "neutral" },
      { t: "We had a great {W} at the new restaurant downtown.", cn: "我们在市中心那家新餐厅度过了愉快的{W}。", tone: "neutral" },
      { t: "She has a natural {W} for solving difficult problems.", cn: "她有解决难题的天生{W}。", tone: "neutral" },
      { t: "The {W} was so boring I almost fell asleep!", cn: "那个{W}太无聊了，我差点睡着了！", tone: "humorous" },
      { t: "Can you give me a {W} about the schedule?", cn: "你能给我一个关于日程的{W}吗？", tone: "neutral" },
      { t: "My brother takes {W} in everything he does.", cn: "我弟弟做每件事都很{W}。", tone: "neutral" },
      { t: "The {W} of this book is what first caught my eye.", cn: "这本书的{W}最先吸引了我的注意。", tone: "neutral" },
      { t: "I need to buy a new {W} for my apartment.", cn: "我需要为公寓买一个新的{W}。", tone: "neutral" },
      { t: "That was a complete {W} of time and money.", cn: "那完全是{W}时间和金钱。", tone: "humorous" },
      { t: "She showed great {W} in handling the difficult customer.", cn: "她在处理那位难缠的顾客时表现出了极大的{W}。", tone: "neutral" },
      { t: "The {W} we had at the party was unforgettable.", cn: "我们在聚会上度过的{W}令人难忘。", tone: "neutral" },
      { t: "What's the {W} of that word in Chinese?", cn: "那个词的中文{W}是什么？", tone: "neutral" },
    ],
    news: [
      { t: "The {W} has become a major topic of public debate.", cn: "这个{W}已成为公众辩论的主要话题。", tone: "formal" },
      { t: "A new {W} was introduced to address the growing concern.", cn: "引入了一项新的{W}来解决日益增长的担忧。", tone: "formal" },
      { t: "The {W} of the crisis was widely reported by the media.", cn: "这场危机的{W}被媒体广泛报道。", tone: "formal" },
      { t: "Officials announced a significant {W} in the investigation.", cn: "官员们宣布了调查中的一项重大{W}。", tone: "formal" },
      { t: "The {W} between the two nations has strengthened over time.", cn: "两国之间的{W}随时间推移而加强。", tone: "formal" },
      { t: "The economic {W} shows signs of steady recovery.", cn: "经济{W}显示出稳定复苏的迹象。", tone: "formal" },
      { t: "The {W} of the agreement marks a historic achievement.", cn: "该协议的{W}标志着历史性的成就。", tone: "formal" },
      { t: "The report highlights the {W} of healthcare reform.", cn: "报告强调了医疗改革的{W}。", tone: "formal" },
      { t: "The {W} will take effect at the beginning of next month.", cn: "该{W}将于下月初生效。", tone: "formal" },
      { t: "A summit on the {W} is scheduled for later this year.", cn: "关于该{W}的峰会定于今年晚些时候举行。", tone: "formal" },
      { t: "The {W} reflects the changing demographics of the region.", cn: "该{W}反映了该地区人口结构的变化。", tone: "formal" },
      { t: "International {W} has been crucial for disaster relief.", cn: "国际{W}对救灾工作至关重要。", tone: "formal" },
      { t: "The {W} in the region has drawn global attention.", cn: "该地区的{W}引起了全球关注。", tone: "formal" },
      { t: "The {W} of the proposal received widespread support.", cn: "该提案的{W}获得了广泛支持。", tone: "formal" },
      { t: "The government invested heavily in public {W}.", cn: "政府在公共{W}上投入了大量资金。", tone: "formal" },
    ],
    academic: [
      { t: "The {W} of this concept is central to the theory.", cn: "这一概念的{W}是理论的核心。", tone: "formal" },
      { t: "The research explores the {W} between language and culture.", cn: "该研究探讨了语言与文化之间的{W}。", tone: "formal" },
      { t: "This {W} appears frequently in CET-4 reading passages.", cn: "这个{W}在大学英语四级阅读文章中频繁出现。", tone: "neutral" },
      { t: "A solid {W} of grammar is essential for writing.", cn: "扎实的语法{W}对写作至关重要。", tone: "neutral" },
      { t: "The study provides a detailed {W} of the phenomenon.", cn: "该研究提供了该现象的详细{W}。", tone: "formal" },
      { t: "The {W} of the experiment was measured precisely.", cn: "该实验的{W}被精确测量。", tone: "formal" },
      { t: "This theory offers a useful {W} for analyzing data.", cn: "该理论为分析数据提供了一个有用的{W}。", tone: "formal" },
      { t: "The {W} serves as a foundation for further research.", cn: "该{W}为进一步研究奠定了基础。", tone: "formal" },
      { t: "The course covers the basic {W} of marketing strategy.", cn: "该课程涵盖营销策略的基本{W}。", tone: "formal" },
      { t: "The {W} demonstrated a clear cause-and-effect relationship.", cn: "该{W}展示了清晰的因果关系。", tone: "formal" },
      { t: "Critical thinking is a key {W} of higher education.", cn: "批判性思维是高等教育的核心{W}。", tone: "neutral" },
      { t: "The {W} of this argument lies in its logical structure.", cn: "这个论点的{W}在于其逻辑结构。", tone: "formal" },
      { t: "The article examines the {W} in different cultural contexts.", cn: "文章考察了{W}在不同文化背景下的表现。", tone: "formal" },
      { t: "A strong {W} in vocabulary helps with reading comprehension.", cn: "扎实的词汇{W}有助于阅读理解。", tone: "neutral" },
      { t: "The {W} was tested across multiple sample groups.", cn: "该{W}在多个样本组中进行了测试。", tone: "formal" },
    ],
  },
  adj: {
    daily: [
      { t: "This place looks really {W} — I love the design!", cn: "这个地方看起来真{W}——我喜欢这个设计！", tone: "neutral" },
      { t: "The weather today is so {W} that I want to stay home.", cn: "今天天气太{W}了，我想待在家里。", tone: "neutral" },
      { t: "She's such a {W} person — everyone likes her.", cn: "她是个很{W}的人——大家都喜欢她。", tone: "neutral" },
      { t: "This food tastes {W} — did you add a secret ingredient?", cn: "这食物尝起来很{W}——你加了秘密配料吗？", tone: "humorous" },
      { t: "I feel really {W} after that long walk.", cn: "走了那么长的路后，我感觉很{W}。", tone: "neutral" },
      { t: "The movie was so {W} I watched it three times!", cn: "这部电影太{W}了，我看了三遍！", tone: "humorous" },
      { t: "My new apartment is more {W} than the old one.", cn: "我的新公寓比旧公寓更{W}。", tone: "neutral" },
      { t: "That's a very {W} thing to say in this situation.", cn: "在这种情况下说这种话很{W}。", tone: "neutral" },
      { t: "He's not just smart — he's genuinely {W}.", cn: "他不仅仅聪明——他是真正地{W}。", tone: "neutral" },
      { t: "The room feels {W} with the new furniture.", cn: "换了新家具后，房间感觉很{W}。", tone: "neutral" },
      { t: "This is the most {W} gift I've ever received!", cn: "这是我收到过的最{W}的礼物！", tone: "neutral" },
      { t: "I find this book incredibly {W} and thought-provoking.", cn: "我发现这本书非常{W}且发人深省。", tone: "neutral" },
      { t: "The puppy is so {W} that everyone wants to adopt it.", cn: "这只小狗太{W}了，每个人都想收养它。", tone: "neutral" },
      { t: "Her voice sounds {W} in this recording.", cn: "她的声音在这段录音中听起来很{W}。", tone: "neutral" },
      { t: "This dress is {W} but also very expensive.", cn: "这条裙子很{W}，但也非常贵。", tone: "neutral" },
    ],
    news: [
      { t: "The economic outlook remains {W} despite recent challenges.", cn: "尽管近期面临挑战，经济前景依然{W}。", tone: "formal" },
      { t: "The government has taken {W} measures to address the issue.", cn: "政府已采取{W}措施来解决这个问题。", tone: "formal" },
      { t: "This region is known for its {W} natural resources.", cn: "该地区以其{W}的自然资源而闻名。", tone: "formal" },
      { t: "The new policy aims to create a more {W} society.", cn: "新政策旨在创造一个更加{W}的社会。", tone: "formal" },
      { t: "The situation has become increasingly {W} in recent months.", cn: "近几个月来，局势变得日益{W}。", tone: "formal" },
      { t: "The report describes the conditions as {W} and unacceptable.", cn: "报告称这些条件{W}且不可接受。", tone: "formal" },
      { t: "A {W} agreement was reached after weeks of negotiation.", cn: "经过数周谈判，达成了一项{W}的协议。", tone: "formal" },
      { t: "The survey reveals a {W} trend among young voters.", cn: "调查揭示了年轻选民中的一个{W}趋势。", tone: "formal" },
      { t: "The {W} impact of climate change is already visible.", cn: "气候变化的{W}影响已经显现。", tone: "formal" },
      { t: "The committee deemed the proposal {W} for further review.", cn: "委员会认为该提案{W}进一步审议。", tone: "formal" },
      { t: "The {W} growth of the industry has attracted global investors.", cn: "该行业的{W}增长吸引了全球投资者。", tone: "formal" },
      { t: "The city has made {W} progress in reducing pollution.", cn: "该市在减少污染方面取得了{W}进展。", tone: "formal" },
      { t: "The technology offers a {W} advantage over traditional methods.", cn: "该技术相比传统方法具有{W}优势。", tone: "formal" },
      { t: "The {W} conditions prompted officials to issue a warning.", cn: "这些{W}的条件促使官员发布了警告。", tone: "formal" },
      { t: "The outcome of the trial was {W} to all observers.", cn: "审判结果对所有观察者来说是{W}的。", tone: "formal" },
    ],
    academic: [
      { t: "This is a {W} concept that students must understand.", cn: "这是一个学生必须理解的{W}概念。", tone: "neutral" },
      { t: "The data shows a {W} difference between the two groups.", cn: "数据显示两组之间存在{W}差异。", tone: "formal" },
      { t: "A {W} analysis of the text reveals multiple layers of meaning.", cn: "对文本进行{W}分析揭示了多层含义。", tone: "formal" },
      { t: "The study provides {W} evidence to support the hypothesis.", cn: "该研究提供了{W}证据来支持假设。", tone: "formal" },
      { t: "It is {W} to note that correlation does not imply causation.", cn: "认识到相关性并不意味着因果关系是{W}的。", tone: "neutral" },
      { t: "This theory remains {W} in modern academic discourse.", cn: "这一理论在现代学术讨论中仍然{W}。", tone: "formal" },
      { t: "The research method must be {W} to ensure valid results.", cn: "研究方法必须{W}以确保结果有效。", tone: "formal" },
      { t: "Students need to be {W} of logical fallacies in arguments.", cn: "学生需要对论证中的逻辑谬误保持{W}。", tone: "neutral" },
      { t: "The assignment requires a {W} understanding of the topic.", cn: "这项作业要求对该主题有{W}的理解。", tone: "neutral" },
      { t: "The {W} nature of the problem demands interdisciplinary study.", cn: "该问题的{W}性需要跨学科研究。", tone: "formal" },
      { t: "The results were {W} across all test groups.", cn: "结果在所有测试组中{W}。", tone: "formal" },
      { t: "The relationship between variables is not immediately {W}.", cn: "变量之间的关系并不直接{W}。", tone: "formal" },
      { t: "A {W} approach is needed to solve complex equations.", cn: "需要一种{W}的方法来解决复杂方程。", tone: "formal" },
      { t: "This textbook is widely considered {W} for exam preparation.", cn: "这本教材被广泛认为对备考{W}。", tone: "neutral" },
      { t: "The essay should include {W} examples to illustrate each point.", cn: "文章应该包含{W}的例子来说明每个观点。", tone: "neutral" },
    ],
  },
  adv: {
    daily: [
      { t: "She spoke {W} during the entire presentation.", cn: "她在整个演讲中{W}地发言。", tone: "neutral" },
      { t: "Please drive {W} — the roads are slippery today.", cn: "请{W}驾驶——今天路很滑。", tone: "neutral" },
      { t: "He {W} finished his homework before dinner.", cn: "他{W}在晚饭前完成了作业。", tone: "neutral" },
      { t: "They {W} agreed to help us with the project.", cn: "他们{W}同意帮助我们做这个项目。", tone: "neutral" },
      { t: "I {W} forgot about our appointment — I'm so sorry!", cn: "我{W}忘了我们的约会——非常抱歉！", tone: "humorous" },
      { t: "She smiled {W} as she read the good news.", cn: "她读到好消息时{W}地笑了。", tone: "neutral" },
      { t: "The waiter {W} brought us our orders.", cn: "服务员{W}给我们上了菜。", tone: "neutral" },
      { t: "He {W} refused to answer any more questions.", cn: "他{W}拒绝回答更多问题。", tone: "neutral" },
      { t: "The kids played {W} all afternoon in the park.", cn: "孩子们在公园里{W}地玩了一整个下午。", tone: "neutral" },
      { t: "I can {W} hear you — please speak up!", cn: "我{W}能听到你——请大声点！", tone: "humorous" },
      { t: "The package arrived {W} this morning.", cn: "包裹今天早上{W}到了。", tone: "neutral" },
      { t: "She {W} explained the problem to the new student.", cn: "她{W}地向新生解释了问题。", tone: "neutral" },
      { t: "They {W} enjoy spending weekends at the beach.", cn: "他们{W}喜欢在海滩度过周末。", tone: "neutral" },
      { t: "He {W} answered every question correctly.", cn: "他{W}正确地回答了每个问题。", tone: "neutral" },
      { t: "The plan worked {W} better than we expected.", cn: "这个计划的效果比预期的{W}好。", tone: "neutral" },
    ],
    news: [
      { t: "The economy is growing {W} this fiscal year.", cn: "本财年经济在{W}增长。", tone: "formal" },
      { t: "Officials {W} denied any involvement in the scandal.", cn: "官员们{W}否认与丑闻有任何牵连。", tone: "formal" },
      { t: "The new policy was {W} implemented across all sectors.", cn: "新政策在所有部门{W}实施。", tone: "formal" },
      { t: "The situation has {W} improved since the intervention.", cn: "自干预以来，情况已{W}改善。", tone: "formal" },
      { t: "The committee {W} approved the revised budget proposal.", cn: "委员会{W}批准了修订后的预算提案。", tone: "formal" },
      { t: "The company's profits have {W} increased this quarter.", cn: "本季度公司利润{W}增长。", tone: "formal" },
      { t: "The ambassador {W} stated that negotiations are ongoing.", cn: "大使{W}表示谈判正在进行中。", tone: "formal" },
      { t: "The region has {W} recovered from the natural disaster.", cn: "该地区已从自然灾害中{W}恢复。", tone: "formal" },
      { t: "The technology is {W} adopted by leading institutions.", cn: "这项技术被领先机构{W}采用。", tone: "formal" },
      { t: "The reforms were {W} welcomed by the public.", cn: "改革受到公众的{W}欢迎。", tone: "formal" },
      { t: "The two countries {W} agreed to strengthen cooperation.", cn: "两国{W}同意加强合作。", tone: "formal" },
      { t: "The proposal was {W} rejected by the board.", cn: "该提案被董事会{W}否决。", tone: "formal" },
      { t: "The population has {W} grown over the past decade.", cn: "过去十年人口{W}增长。", tone: "formal" },
      { t: "The policy was {W} criticized by opposition parties.", cn: "该政策遭到反对党的{W}批评。", tone: "formal" },
      { t: "The project was {W} completed ahead of schedule.", cn: "该项目已{W}提前完成。", tone: "formal" },
    ],
    academic: [
      { t: "The data {W} supports the proposed hypothesis.", cn: "数据{W}支持所提出的假设。", tone: "formal" },
      { t: "The theory {W} explains a wide range of phenomena.", cn: "该理论{W}解释了广泛的现象。", tone: "formal" },
      { t: "The results {W} differ from previous studies in this field.", cn: "结果与该领域先前的研究{W}不同。", tone: "formal" },
      { t: "The concept is {W} defined in the textbook.", cn: "这个概念在教材中{W}定义。", tone: "neutral" },
      { t: "The variable {W} affects the outcome of the experiment.", cn: "该变量{W}影响实验结果。", tone: "formal" },
      { t: "The correlation is {W} significant at the 0.05 level.", cn: "该相关性在0.05水平上{W}显著。", tone: "formal" },
      { t: "The methodology is {W} described in the appendix.", cn: "研究方法在附录中{W}描述。", tone: "formal" },
      { t: "The findings are {W} consistent with earlier research.", cn: "这些发现与早期研究{W}一致。", tone: "formal" },
      { t: "The distribution {W} follows a normal curve.", cn: "该分布{W}遵循正态曲线。", tone: "formal" },
      { t: "The argument {W} relies on a flawed assumption.", cn: "该论点{W}依赖于一个有缺陷的假设。", tone: "formal" },
      { t: "The phenomenon {W} occurs in multiple contexts.", cn: "该现象在多种情境中{W}发生。", tone: "formal" },
      { t: "The sample was {W} selected to represent the population.", cn: "样本被{W}选择以代表总体。", tone: "neutral" },
      { t: "The function {W} increases as x approaches infinity.", cn: "当x趋近于无穷时，该函数{W}增加。", tone: "formal" },
      { t: "The author {W} argues that further research is needed.", cn: "作者{W}认为需要进一步研究。", tone: "formal" },
      { t: "The variance is {W} distributed among the subgroups.", cn: "方差在亚组之间{W}分布。", tone: "formal" },
    ],
  },
  other: {
    daily: [
      { t: "That's exactly {W} what I was thinking!", cn: "那正是{W}我在想的！", tone: "neutral" },
      { t: "This is {W} something we should discuss later.", cn: "这{W}是我们以后应该讨论的事情。", tone: "neutral" },
      { t: "The situation is {W} different from what we expected.", cn: "情况和我们预期的{W}不同。", tone: "neutral" },
      { t: "I'll call you {W} I arrive at the station.", cn: "我{W}到车站就给你打电话。", tone: "neutral" },
      { t: "She acted {W} a true professional during the crisis.", cn: "她在危机中表现得{W}真正的专业人士。", tone: "neutral" },
      { t: "This is {W} the best pizza in town!", cn: "这{W}是城里最好吃的披萨！", tone: "humorous" },
      { t: "We need to finish this {W} we leave.", cn: "我们需要在离开{W}完成这个。", tone: "neutral" },
      { t: "It's {W} a small world — I ran into my old classmate!", cn: "这{W}是个小世界——我遇到了老同学！", tone: "humorous" },
      { t: "The store is open {W} the holidays.", cn: "这家商店{W}节假日营业。", tone: "neutral" },
      { t: "He did it {W} knowing the consequences.", cn: "他{W}知道后果还是做了。", tone: "neutral" },
    ],
    news: [
      { t: "The decision was made {W} the circumstances.", cn: "决定是{W}情况做出的。", tone: "formal" },
      { t: "The policy applies {W} to all member states.", cn: "该政策{W}适用于所有成员国。", tone: "formal" },
      { t: "The investigation continues {W} the lack of evidence.", cn: "调查在缺乏证据的情况下{W}进行。", tone: "formal" },
      { t: "The agreement will remain in effect {W} further notice.", cn: "该协议将{W}另行通知一直有效。", tone: "formal" },
      { t: "The country has been {W} a state of emergency.", cn: "该国一直{W}紧急状态。", tone: "formal" },
      { t: "The project was delayed {W} budget constraints.", cn: "该项目{W}预算限制而被推迟。", tone: "formal" },
      { t: "The treaty was signed {W} the two neighboring countries.", cn: "该条约{W}两个邻国签署。", tone: "formal" },
      { t: "The program operates {W} the supervision of experts.", cn: "该计划{W}专家的监督下运行。", tone: "formal" },
      { t: "The funds were allocated {W} the new education plan.", cn: "资金{W}新教育计划进行分配。", tone: "formal" },
      { t: "The event took place {W} schedule despite the challenges.", cn: "尽管面临挑战，活动{W}计划进行。", tone: "formal" },
    ],
    academic: [
      { t: "This phenomenon is observed {W} in different cultures.", cn: "这种现象在不同文化中{W}被观察到。", tone: "formal" },
      { t: "The formula holds true {W} certain conditions.", cn: "该公式{W}某些条件成立。", tone: "formal" },
      { t: "The analysis is conducted {W} the framework of critical theory.", cn: "分析{W}批判理论框架进行。", tone: "formal" },
      { t: "The results vary {W} the population being studied.", cn: "结果{W}所研究的人群而变化。", tone: "formal" },
      { t: "The model is defined {W} a set of linear equations.", cn: "该模型{W}一组线性方程定义。", tone: "formal" },
      { t: "The concept applies {W} various academic disciplines.", cn: "该概念适用于{W}学术学科。", tone: "formal" },
      { t: "The behavior is studied {W} its social context.", cn: "该行为在其社会背景{W}被研究。", tone: "formal" },
      { t: "The data was collected {W} standardized procedures.", cn: "数据{W}标准化程序收集。", tone: "formal" },
      { t: "The theory evolved {W} feedback from the scientific community.", cn: "该理论{W}科学界的反馈而发展。", tone: "formal" },
      { t: "The approach is used {W} the study of complex systems.", cn: "该方法在复杂系统研究{W}被使用。", tone: "formal" },
    ],
  },
}

function getPosCategory(pos) {
  if (!pos) return 'other'
  const p = pos.toLowerCase()
  if (p.startsWith('v')) return 'verb'
  if (p.startsWith('n')) return 'noun'
  if (p.startsWith('adj')) return 'adj'
  if (p.startsWith('adv')) return 'adv'
  return 'other'
}

const transPatterns = {
  daily: "这个单词在日常对话中表示「{D}」。",
  news: "在新闻报道中，「{D}」是一个常见术语。",
  academic: "在考试语境中，理解「{D}」的概念非常重要。",
}

function levenshtein(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0))
  for (let i = 0; i <= m; i++) dp[i][0] = i
  for (let j = 0; j <= n; j++) dp[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function isTooSimilar(a, b, threshold = 0.5) {
  const maxLen = Math.max(a.length, b.length)
  if (maxLen === 0) return true
  return levenshtein(a, b) / maxLen < threshold
}

const scenarioLabels = {
  daily: '日常对话',
  news: '新闻评论',
  academic: '学术考试',
}

// ── Word ending-based conjugation helper ──
function conjugate(word, pattern) {
  let w = word.toLowerCase()
  // Handle {W}s (third person)
  pattern = pattern.replace(/\{W\}s/g, () => {
    if (/[sxz]$|sh$|ch$/.test(w)) return w + 'es'
    if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ies'
    return w + 's'
  })
  // Handle {W}ed (past tense)
  pattern = pattern.replace(/\{W\}ed/g, () => {
    if (/e$/.test(w)) return w + 'd'
    if (/[^aeiou]y$/.test(w)) return w.slice(0, -1) + 'ied'
    return w + 'ed'
  })
  // Handle remaining {W}
  pattern = pattern.replace(/\{W\}/g, w)
  return pattern
}

function generateDiverseExamples(wordData) {
  return wordData.map(w => {
    const category = getPosCategory(w.pos)
    const catPatterns = patterns[category] || patterns.other
    const wordLower = w.word.toLowerCase()

    const defCn = w.definition ? w.definition.split(/[\s　]+/)[0] : w.word

    const examples = []
    const usedTexts = []

    const scenarios = ['daily', 'news', 'academic']
    for (const scenario of scenarios) {
      const scenarioPatterns = catPatterns[scenario] || catPatterns.daily
      const shuffled = [...scenarioPatterns].sort(() => Math.random() - 0.5)
      let picked = false

      for (const pattern of shuffled) {
        const text = conjugate(wordLower, pattern.t)
        // For Chinese template, replace {W} with the word's Chinese definition
        const cn = pattern.cn ? pattern.cn.replace(/\{W\}/g, defCn) : ''

        const tooSim = usedTexts.some(ut => isTooSimilar(ut, text))
        if (tooSim && usedTexts.length > 0) continue

        const trans = transPatterns[scenario].replace('{D}', defCn)

        let freq
        if (scenario === 'academic') freq = 5
        else if (scenario === 'news') freq = 3
        else freq = 2

        examples.push({ text, translation: cn || trans, cn, tone: pattern.tone, scenario: scenarioLabels[scenario], frequency: freq })
        usedTexts.push(text)
        picked = true
        break
      }

      // Fallback if no pattern worked
      if (!picked) {
        const text = `The concept of ${wordLower} is important in ${scenario} contexts.`
        const cn = `${defCn}的概念在${scenario === 'daily' ? '日常' : scenario === 'news' ? '新闻' : '学术'}语境中很重要。`
        const trans = transPatterns[scenario].replace('{D}', defCn)
        examples.push({ text, translation: cn, cn, tone: 'neutral', scenario: scenarioLabels[scenario], frequency: scenario === 'academic' ? 5 : 3 })
        usedTexts.push(text)
      }
    }

    examples.sort((a, b) => b.frequency - a.frequency)

    const { example, exampleTranslation, ...rest } = w
    return { ...rest, examples }
  })
}

const filePath = path.join(__dirname, '..', 'src', 'data', 'words.js')
const content = fs.readFileSync(filePath, 'utf8')
const match = content.match(/\[([\s\S]*)\]/)
if (!match) {
  console.error('Could not parse words.js')
  process.exit(1)
}

const wordData = JSON.parse(match[0])
const updated = generateDiverseExamples(wordData)

const outPath = path.join(__dirname, '..', 'src', 'data', 'words.js')
const code = `const words = ${JSON.stringify(updated)}
export default words`
fs.writeFileSync(outPath, code, 'utf8')
console.log('Done! Wrote', updated.length, 'words to', outPath)
