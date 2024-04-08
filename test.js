import fs from 'fs';
import os from 'os';

// Mendapatkan path root
const rootPath = os.platform() === 'win32' ? 'C:\\' : '/sdcard';

// Mendapatkan informasi disk
const diskInfo = await fs.statSync(rootPath);

// Menghitung total disk dalam GB
const totalDiskGB = diskInfo.size / (1024 * 1024 * 1024);

// Menghitung free disk dalam GB
const freeDiskGB = diskInfo.blocksAvailable / (1024 * 1024 * 1024);

console.log('Total Disk:', totalDiskGB, 'GB');
console.log('Free Disk:', freeDiskGB, 'GB');
