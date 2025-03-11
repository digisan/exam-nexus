
// 模拟用户数据
const users = [
    { id: '123', name: '张三' },
    { id: '456', name: '李四' },
]

class UserController {

    getUserList() {
        return users.map((user) => user.id)
    }

    getUserDetails(id: number | string) {
        return users.find((u) => u.id == id);
    }
}

export { UserController };