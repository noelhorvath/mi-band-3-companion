export enum BLEStatus {
    ENABLED = 'enabled',
    ENABLING = 'enabling',
    DISABLED = 'disabled'
}

export enum BLESubscriptionStatus {
    SUBSCRIBED = 'subscribed',
    UNSUBSCRIBED = 'unsubscribed'
}

export enum BLEConnectionStatus {
    CONNECTED = 'connected',
    CONNECTING = 'connecting',
    DISCONNECTED = 'disconnected',
    CONNECTION_ERROR = 'connection error'
}

export enum BLEScanStatus {
    SCANNING = 'scanning',
    FINISHED = 'finished', // scanning stopped and (scanned devices) results are ready
    NOT_SCANNING = 'not scanning' // when scanning stopped by an error or scanning haven't been used
}

export enum BLEProperty {
    READ = 'READ',
    WRITE = 'WRITE',
    WRITE_WITHOUT_RESPONSE = 'WRITE_WITHOUT_RESPONSE',
    INDICATE = 'INDICATE'
}

export enum BLEGender {
    MALE = 0x00,
    FEMALE = 0x01,
    OTHER =  0x02
}
