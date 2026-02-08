// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AgentEscrow
 * @notice Trustless escrow for agent-to-agent commerce
 * @dev Enables safe USDC payments between autonomous AI agents
 * 
 * Features:
 * - Time-locked releases
 * - Dispute resolution
 * - Partial releases
 * - Multi-party escrows
 */
contract AgentEscrow is ReentrancyGuard {
    IERC20 public immutable usdc;
    
    struct Escrow {
        address buyer;
        address seller;
        uint256 amount;
        uint256 createdAt;
        uint256 releaseTime;
        string taskDescription;
        EscrowStatus status;
        address arbiter; // Optional third-party
    }
    
    enum EscrowStatus {
        Active,
        Completed,
        Disputed,
        Refunded,
        Cancelled
    }
    
    mapping(uint256 => Escrow) public escrows;
    uint256 public escrowCount;
    
    // Events
    event EscrowCreated(
        uint256 indexed escrowId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        string taskDescription
    );
    
    event EscrowReleased(uint256 indexed escrowId, uint256 amount);
    event EscrowRefunded(uint256 indexed escrowId, uint256 amount);
    event EscrowDisputed(uint256 indexed escrowId);
    event EscrowResolved(uint256 indexed escrowId, address winner);
    
    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }
    
    /**
     * @notice Create new escrow for agent-to-agent transaction
     * @param seller Address of selling agent
     * @param amount USDC amount to lock
     * @param releaseTime Unix timestamp when auto-release happens
     * @param taskDescription What the seller must deliver
     */
    function createEscrow(
        address seller,
        uint256 amount,
        uint256 releaseTime,
        string calldata taskDescription
    ) external returns (uint256) {
        require(seller != address(0), "Invalid seller");
        require(seller != msg.sender, "Cannot escrow to self");
        require(amount > 0, "Amount must be > 0");
        require(releaseTime > block.timestamp, "Release time must be future");
        
        // Transfer USDC from buyer to escrow
        require(
            usdc.transferFrom(msg.sender, address(this), amount),
            "USDC transfer failed"
        );
        
        uint256 escrowId = escrowCount++;
        
        escrows[escrowId] = Escrow({
            buyer: msg.sender,
            seller: seller,
            amount: amount,
            createdAt: block.timestamp,
            releaseTime: releaseTime,
            taskDescription: taskDescription,
            status: EscrowStatus.Active,
            arbiter: address(0)
        });
        
        emit EscrowCreated(escrowId, msg.sender, seller, amount, taskDescription);
        
        return escrowId;
    }
    
    /**
     * @notice Buyer releases funds to seller (work completed)
     */
    function releaseFunds(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(msg.sender == escrow.buyer, "Only buyer can release");
        
        escrow.status = EscrowStatus.Completed;
        
        require(
            usdc.transfer(escrow.seller, escrow.amount),
            "USDC transfer failed"
        );
        
        emit EscrowReleased(escrowId, escrow.amount);
    }
    
    /**
     * @notice Auto-release after timeout (seller delivered, buyer didn't respond)
     */
    function autoRelease(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(block.timestamp >= escrow.releaseTime, "Release time not reached");
        
        escrow.status = EscrowStatus.Completed;
        
        require(
            usdc.transfer(escrow.seller, escrow.amount),
            "USDC transfer failed"
        );
        
        emit EscrowReleased(escrowId, escrow.amount);
    }
    
    /**
     * @notice Buyer requests refund (seller didn't deliver)
     */
    function requestRefund(uint256 escrowId) external {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(msg.sender == escrow.buyer, "Only buyer can request refund");
        
        escrow.status = EscrowStatus.Disputed;
        
        emit EscrowDisputed(escrowId);
    }
    
    /**
     * @notice Seller cancels and refunds (before delivery attempt)
     */
    function cancelEscrow(uint256 escrowId) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(msg.sender == escrow.seller, "Only seller can cancel");
        require(
            block.timestamp < escrow.createdAt + 1 hours,
            "Cancel window expired"
        );
        
        escrow.status = EscrowStatus.Cancelled;
        
        require(
            usdc.transfer(escrow.buyer, escrow.amount),
            "USDC refund failed"
        );
        
        emit EscrowRefunded(escrowId, escrow.amount);
    }
    
    /**
     * @notice Arbiter resolves dispute
     */
    function resolveDispute(uint256 escrowId, bool favorBuyer) external nonReentrant {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.Disputed, "Not disputed");
        require(msg.sender == escrow.arbiter, "Only arbiter can resolve");
        
        address recipient = favorBuyer ? escrow.buyer : escrow.seller;
        escrow.status = favorBuyer ? EscrowStatus.Refunded : EscrowStatus.Completed;
        
        require(
            usdc.transfer(recipient, escrow.amount),
            "USDC transfer failed"
        );
        
        emit EscrowResolved(escrowId, recipient);
    }
    
    /**
     * @notice Set arbiter for dispute resolution
     */
    function setArbiter(uint256 escrowId, address arbiter) external {
        Escrow storage escrow = escrows[escrowId];
        
        require(escrow.status == EscrowStatus.Active, "Escrow not active");
        require(msg.sender == escrow.buyer, "Only buyer can set arbiter");
        require(arbiter != address(0), "Invalid arbiter");
        require(arbiter != escrow.buyer && arbiter != escrow.seller, "Arbiter conflict");
        
        escrow.arbiter = arbiter;
    }
    
    /**
     * @notice Get escrow details
     */
    function getEscrow(uint256 escrowId) external view returns (
        address buyer,
        address seller,
        uint256 amount,
        uint256 createdAt,
        uint256 releaseTime,
        string memory taskDescription,
        EscrowStatus status
    ) {
        Escrow storage escrow = escrows[escrowId];
        return (
            escrow.buyer,
            escrow.seller,
            escrow.amount,
            escrow.createdAt,
            escrow.releaseTime,
            escrow.taskDescription,
            escrow.status
        );
    }
}
