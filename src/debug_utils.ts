const DEBUG_ENABLED = false;

export function debug(obj: any) {
    if (DEBUG_ENABLED) {
        console.log(obj);
    }
}
