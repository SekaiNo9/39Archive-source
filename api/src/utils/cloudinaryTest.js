function uploadToCloudinary(file, folderName) {
    return Promise.resolve({
        url: 'test-url',
        fileId: 'test-id'
    });
}

function deleteFromCloudinary(url) {
    return Promise.resolve({ result: 'ok' });
}

function testCloudinaryConnection() {
    return Promise.resolve({ success: true });
}

module.exports = {
    uploadToCloudinary,
    deleteFromCloudinary,
    testCloudinaryConnection
};
