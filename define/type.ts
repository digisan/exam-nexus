export type Email = string & { __brand: 'Email' };
export const isEmail = (s: string): s is Email => {
    const reg = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    return reg.test(s)
}

export type Password = string & { __brand: 'Password' };
export const isAllowedPassword = (s: string): s is Password => {
    const reg = /^\S*(?=\S{8,})(?=\S*\d)(?=\S*[A-Z])(?=\S*[a-z])(?=\S*[!@#$%^&*? ])\S*$/
    return reg.test(s)
}

// export type ExistEmail = Email & { __brand: 'ExistEmail' };
// export const isExistEmail = (s: Email): s is ExistEmail => {
//     const agent = new SupabaseAgent();
//     agent.
// }