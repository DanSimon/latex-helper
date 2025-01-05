const DEBUG_ENABLED = true;

export function debug(obj: any) {
    if (DEBUG_ENABLED) {
        console.log(obj);
    }
}
