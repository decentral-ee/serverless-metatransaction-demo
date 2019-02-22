pragma solidity ^0.5.0;

contract MetraTransactable {

    struct Vault {
        uint64 nonce;
        uint256 timeUpdated;
        string data;
    }

    mapping(address => Vault) public vaults;

    function updateVault(string memory data) public {
        _updateVault(msg.sender, data);
    }

    function validateVaultUpdateRequest(
        address vaultOwner,
        uint64 nonce,
        string memory data,
        uint8 v, bytes32 r, bytes32 s) public view returns (string memory errorReason) {
        Vault storage vault = vaults[vaultOwner];
        if (nonce <= vault.nonce) {
            return "Nonce should be increased";
        }
        bytes memory prefix = "\x19Ethereum Signed Message:\n32";
        bytes32 msgHash = keccak256(abi.encode(nonce, data));
        bytes32 prefixedHash = keccak256(abi.encodePacked(prefix, msgHash));
        if (ecrecover(prefixedHash, v, r, s) != vaultOwner) {
            return "Invalid signature";
        }
    }

    function executeUpdateRequest(
        address vaultOwner,
        uint64 nonce,
        string memory data,
        uint8 v, bytes32 r, bytes32 s) public {
        Vault storage vault = vaults[vaultOwner];

        string memory errorReason = validateVaultUpdateRequest(vaultOwner, nonce, data, v, r, s);
        if (bytes(errorReason).length > 0) {
            revert(errorReason);
        }

        vault.nonce = nonce;
        _updateVault(vaultOwner, data);
    }

    function _updateVault(address vaultOwner, string memory data) internal {
        Vault storage vault = vaults[vaultOwner];
        vault.timeUpdated = now;
        vault.data = data;
    }
}
