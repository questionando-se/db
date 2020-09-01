import path from 'path';
import fs from 'fs';

/**
 * prepare path for file creation (create all directories if not exists [in ...names list])
 * @param basePath the base path to join.
 * @param names the path folders.
 */
export function preparePath(basePath: string, ...names: string[]): string {
    let currentPath = basePath;
    names.forEach((n) => {
        currentPath = path.join(currentPath, n);
        if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath);
            if (!fs.existsSync(currentPath)) {
                console.error('can\'t create the path: "' + name + '". make this manualy.')
                process.exit(1);
            }
        }
    });
    return currentPath;
}
