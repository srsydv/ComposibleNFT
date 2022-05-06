// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";



interface ERC998ERC20TopDown {
    event ReceivedERC20(address indexed _from, uint256 indexed _tokenId, address indexed _erc20Contract, uint256 _value);
    event TransferERC20(uint256 indexed _tokenId, address indexed _to, address indexed _erc20Contract, uint256 _value);

    function tokenFallback(address _from, uint256 _value, bytes calldata  _data) external;
    function balanceOfERC20(uint256 _tokenId, address __erc20Contract) external view returns (uint256);
    function transferERC20(uint256 _tokenId, address _to, address _erc20Contract, uint256 _value) external;
    function transferERC223(uint256 _tokenId, address _to, address _erc223Contract, uint256 _value, bytes calldata _data) external;
    function getERC20(address _from, uint256 _tokenId, address _erc20Contract, uint256 _value) external;

}
interface IERC20AndERC223 {
    function transferFrom(address _from, address _to, uint _value) external returns (bool success);
    function transfer(address to, uint value) external returns (bool success);
    function transfer(address to, uint value, bytes calldata data) external returns (bool success);
    function allowance(address _owner, address _spender) external view returns (uint256 remaining);
}



contract cNFT is ERC721("ComposableNFT", "cNFT") {
    using SafeMath for uint;
    uint private _totalTokenId = 0;

    event ReceivedERC20(address indexed _from, uint256 indexed _tokenId, address indexed _erc20Contract, uint256 _value);
    event TransferERC20(uint256 indexed _tokenId, address indexed _to, address indexed _erc20Contract, uint256 _value);
    event TransferNFT(address from, address to, uint tokenId);

    // tokenId => token contract
    mapping(uint256 => address[]) erc20Contracts;

    // tokenId => token owner
    mapping(uint256 => address) internal tokenIdToTokenCreater;

    // tokenId => token owner
    mapping(uint256 => address) internal tokenIdToTokenOwner;

    // token owner address => token count
    mapping(address => uint256) internal tokenOwnerToTokenCount;

    // tokenId => (token contract => token contract index)
    mapping(uint256 => mapping(address => uint256)) erc20ContractIndex;

    // tokenId => (token contract => balance)
    mapping(uint256 => mapping(address => uint256)) erc20Balances;

    // 0xF7D3bdf086d66E548c945CA410BB80Fc00E49831
    // 0x29d14148f9fd7F8EA48c1F81E494c9Bf859CB074
    // 0x4c676085933233E3b875De927D7E05212C20c800

    function _transferNFT(address _from, address _to, uint256 _tokenId) private {
        require(_from != address(0));
        require(tokenIdToTokenOwner[_tokenId] == _from);
        require(_to != address(0));
        if(_from != _to) {
            assert(tokenOwnerToTokenCount[_from] > 0);
            tokenOwnerToTokenCount[_from]--;
            tokenIdToTokenOwner[_tokenId] = _to;
            tokenOwnerToTokenCount[_to]++;
        }
        emit TransferNFT(_from, _to, _tokenId);

    }

    function transferTheNFT(address _from, address _to, uint256 _tokenId) external {
        IERC721 curruntNFTaddress = IERC721(address(this));
        curruntNFTaddress.safeTransferFrom(msg.sender, address(this), _tokenId);
        _transferNFT(_from, _to, _tokenId);
    }

    function mint(address _recipient) public returns (uint256) {
        _totalTokenId = SafeMath.add(_totalTokenId, 1);
        _mint(_recipient, _totalTokenId);
        tokenIdToTokenOwner[_totalTokenId] = _recipient;
        tokenIdToTokenCreater[_totalTokenId] = _recipient;
        tokenOwnerToTokenCount[_recipient]++;
        return _totalTokenId;
    }

    function totalNoOfTokenId() external view returns (uint256) {
        return _totalTokenId;
    }

    function knowCreater(uint _tokenId) external view returns (address) {
        return tokenIdToTokenCreater[_tokenId];
    }

    function balanceOfERC20(uint256 _tokenId, address _erc20Contract) external view returns (uint256) {
        return erc20Balances[_tokenId][_erc20Contract];
    }

    function energizeWithERC20(
        address _from,
        uint256 _tokenId,
        address _erc20Contract,
        uint256 _value
    ) public {
        require(_from == msg.sender, "Not allowed to getERC20");
        erc20Received(_from, _tokenId, _erc20Contract, _value);

        require(
            IERC20AndERC223(_erc20Contract).transferFrom(_from, address(this), _value),
            "ERC20 transfer failed."
        );
    }

    function erc20Received(address _from, uint256 _tokenId, address _erc20Contract, uint256 _value) private {
        require(_exists(_tokenId), "Invalid tokenId");
        if (_value == 0) {
            return;
        }
        uint256 erc20Balance = erc20Balances[_tokenId][_erc20Contract];
        if (erc20Balance == 0) {
            erc20ContractIndex[_tokenId][_erc20Contract] = erc20Contracts[_tokenId].length;
            erc20Contracts[_tokenId].push(_erc20Contract);
        }
        erc20Balances[_tokenId][_erc20Contract] = erc20Balance + _value;
        emit ReceivedERC20(_from, _tokenId, _erc20Contract, _value);
    }

    function removeERC20(uint256 _tokenId, address _erc20Contract, uint256 _value) private {
        if (_value == 0) {
            return;
        }
        uint256 erc20Balance = erc20Balances[_tokenId][_erc20Contract];
        require(erc20Balance >= _value, "Not enough token available to transfer.");
        uint256 newERC20Balance = erc20Balance - _value;
        erc20Balances[_tokenId][_erc20Contract] = newERC20Balance;
        if (newERC20Balance == 0) {
            uint256 lastContractIndex = erc20Contracts[_tokenId].length - 1;
            address lastContract = erc20Contracts[_tokenId][lastContractIndex];
            if (_erc20Contract != lastContract) {
                uint256 contractIndex = erc20ContractIndex[_tokenId][_erc20Contract];
                erc20Contracts[_tokenId][contractIndex] = lastContract;
                erc20ContractIndex[_tokenId][lastContract] = contractIndex;
            }
            erc20Contracts[_tokenId].pop();
        }
    }

    function transferERC20(uint256 _tokenId, address _to, address _erc20Contract, uint256 _value) external  {
        require(_to != address(0), "ERC20 transfer to zero address");
        require(_isApprovedOrOwner(msg.sender, _tokenId), "ERC721 transfer caller is not owner nor approved");
        removeERC20(_tokenId, _erc20Contract, _value);
        require(IERC20AndERC223(_erc20Contract).transfer(_to, _value), "ERC20 transfer failed.");
        emit TransferERC20(_tokenId, _to, _erc20Contract, _value);
    }

    function transferERC223(
        uint256 _tokenId,
        address _to,
        address _erc223Contract,
        uint256 _value,
        bytes calldata _data
    ) external  {
        require(_to != address(0), "ERC20 transfer to the zero address");
        require(_isApprovedOrOwner(msg.sender, _tokenId));
        removeERC20(_tokenId, _erc223Contract, _value);
        require(IERC20AndERC223(_erc223Contract).transfer(_to, _value, _data), "ERC223 transfer failed.");
        emit TransferERC20(_tokenId, _to, _erc223Contract, _value);
    }

}


