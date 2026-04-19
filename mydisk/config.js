// 文件云盘配置文件
// 在这里添加你的文件和文件夹

const siteConfig = {
    // 个人简介
    profile: {
        name: "小道",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=xiaodao",
        bio: "AI时代的超级个体 / 全能操盘手",
        email: "xiaodao@example.com",
        github: "https://github.com/xiaodao",
        wechat: "xd_ai assistant"
    },
    
    // 网站简介
    siteInfo: {
        title: "小道的文件站",
        description: "简约二次元风格的文件分享平台",
        version: "1.0.0"
    },
    
    // 联系方式
    contact: {
        email: "xiaodao@example.com",
        github: "https://github.com/xiaodao"
    },
    
    // 文件夹和文件列表
    folders: [
        {
            name: "📁 编程资源",
            description: "编程学习资料和工具",
            files: [
                { name: "Python入门指南.pdf", size: "2.3 MB", url: "files/python-guide.pdf" },
                { name: "VSCode配置.json", size: "12 KB", url: "files/vscode-config.json" }
            ]
        },
        {
            name: "📁 项目作品",
            description: "个人项目和作品集",
            files: [
                { name: "AI助手项目源码.zip", size: "15.8 MB", url: "files/ai-assistant.zip" },
                { name: "网站模板.html", size: "28 KB", url: "files/site-template.html" }
            ]
        },
        {
            name: "📁 学习笔记",
            description: "各类学习笔记整理",
            files: [
                { name: "Machine Learning笔记.pdf", size: "5.2 MB", url: "files/ml-notes.pdf" },
                { name: "英语单词本.txt", size: "156 KB", url: "files/english-words.txt" }
            ]
        },
        {
            name: "📁 素材资源",
            description: "图片、图标等素材",
            files: [
                { name: "二次元头像包.zip", size: "8.5 MB", url: "files/avatars.zip" },
                { name: "背景音乐.mp3", size: "4.1 MB", url: "files/bgm.mp3" }
            ]
        }
    ]
};