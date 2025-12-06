export const ADWARE_SIGNATURES = {
    extensions: [
        { id: 'hndfjkegemddgiimejelipedmbakjefk', name: 'Searchit!', threatLevel: 'High' },
        { id: 'neebplgakaahbhdphmkckjjcegoiijjo', name: 'KeepSolid VPN Unlimited', threatLevel: 'Medium' }, // Example of potentially unwanted
        { id: 'aedipmjaaaikelllcfclbgeilnljhlnj', name: 'CoolSearch', threatLevel: 'High' },
    ],
    launchAgents: [
        { name: 'com.search.manager.plist', threatLevel: 'High' },
        { name: 'com.chill-tab.runner.plist', threatLevel: 'High' },
        { name: 'com.mycoupon.smart.plist', threatLevel: 'Medium' },
        { name: 'com.maccleaning.helper.plist', threatLevel: 'medium' }
    ],
    files: [
        '~/Library/Application Support/Chill Tab',
        '~/Library/Application Support/Spigot',
    ]
};
