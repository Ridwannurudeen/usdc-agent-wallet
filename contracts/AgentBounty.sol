// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AgentBounty
 * @notice Autonomous bounty system for AI agent tasks
 * @dev Allows agents to post and claim bounties with USDC rewards
 * 
 * Use Cases:
 * - Data analysis bounties
 * - Code generation tasks
 * - Research assignments
 * - Content creation
 */
contract AgentBounty is Ownable {
    IERC20 public immutable usdc;
    
    struct Bounty {
        address creator;
        string taskDescription;
        string requiredProof; // What claimant must provide
        uint256 reward;
        uint256 deadline;
        address claimant;
        bool completed;
        bool cancelled;
    }
    
    mapping(uint256 => Bounty) public bounties;
    mapping(uint256 => string) public submissions; // bountyId => submission URL/hash
    uint256 public bountyCount;
    
    uint256 public constant MIN_BOUNTY = 1e6; // 1 USDC minimum
    uint256 public platformFee = 200; // 2% (in basis points)
    
    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        uint256 reward,
        string taskDescription
    );
    
    event BountyClaimed(uint256 indexed bountyId, address indexed claimant);
    event BountyCompleted(uint256 indexed bountyId, address indexed claimant, uint256 reward);
    event BountyCancelled(uint256 indexed bountyId);
    event SubmissionAdded(uint256 indexed bountyId, string submission);
    
    constructor(address _usdc) {
        usdc = IERC20(_usdc);
    }
    
    /**
     * @notice Create new bounty
     * @param taskDescription What needs to be done
     * @param requiredProof What claimant must submit
     * @param reward USDC amount for completion
     * @param duration Time in seconds until deadline
     */
    function createBounty(
        string calldata taskDescription,
        string calldata requiredProof,
        uint256 reward,
        uint256 duration
    ) external returns (uint256) {
        require(reward >= MIN_BOUNTY, "Reward too small");
        require(duration > 0, "Invalid duration");
        require(bytes(taskDescription).length > 0, "Empty description");
        
        // Transfer USDC to contract
        require(
            usdc.transferFrom(msg.sender, address(this), reward),
            "USDC transfer failed"
        );
        
        uint256 bountyId = bountyCount++;
        
        bounties[bountyId] = Bounty({
            creator: msg.sender,
            taskDescription: taskDescription,
            requiredProof: requiredProof,
            reward: reward,
            deadline: block.timestamp + duration,
            claimant: address(0),
            completed: false,
            cancelled: false
        });
        
        emit BountyCreated(bountyId, msg.sender, reward, taskDescription);
        
        return bountyId;
    }
    
    /**
     * @notice Claim a bounty (agent commits to completing it)
     */
    function claimBounty(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        
        require(!bounty.completed, "Already completed");
        require(!bounty.cancelled, "Bounty cancelled");
        require(bounty.claimant == address(0), "Already claimed");
        require(block.timestamp < bounty.deadline, "Deadline passed");
        require(msg.sender != bounty.creator, "Cannot claim own bounty");
        
        bounty.claimant = msg.sender;
        
        emit BountyClaimed(bountyId, msg.sender);
    }
    
    /**
     * @notice Submit proof of completion
     */
    function submitProof(uint256 bountyId, string calldata proofUrl) external {
        Bounty storage bounty = bounties[bountyId];
        
        require(msg.sender == bounty.claimant, "Not the claimant");
        require(!bounty.completed, "Already completed");
        require(!bounty.cancelled, "Bounty cancelled");
        require(bytes(proofUrl).length > 0, "Empty proof");
        
        submissions[bountyId] = proofUrl;
        
        emit SubmissionAdded(bountyId, proofUrl);
    }
    
    /**
     * @notice Creator approves and releases reward
     */
    function approveBounty(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        
        require(msg.sender == bounty.creator, "Not the creator");
        require(bounty.claimant != address(0), "No claimant");
        require(!bounty.completed, "Already completed");
        require(!bounty.cancelled, "Bounty cancelled");
        require(bytes(submissions[bountyId]).length > 0, "No submission");
        
        bounty.completed = true;
        
        // Calculate fee
        uint256 fee = (bounty.reward * platformFee) / 10000;
        uint256 claimantReward = bounty.reward - fee;
        
        // Transfer reward to claimant
        require(
            usdc.transfer(bounty.claimant, claimantReward),
            "Reward transfer failed"
        );
        
        // Platform fee (could go to treasury or burn)
        if (fee > 0) {
            require(
                usdc.transfer(owner(), fee),
                "Fee transfer failed"
            );
        }
        
        emit BountyCompleted(bountyId, bounty.claimant, claimantReward);
    }
    
    /**
     * @notice Cancel bounty (before claiming or after deadline)
     */
    function cancelBounty(uint256 bountyId) external {
        Bounty storage bounty = bounties[bountyId];
        
        require(msg.sender == bounty.creator, "Not the creator");
        require(!bounty.completed, "Already completed");
        require(!bounty.cancelled, "Already cancelled");
        require(
            bounty.claimant == address(0) || block.timestamp > bounty.deadline,
            "Cannot cancel active bounty"
        );
        
        bounty.cancelled = true;
        
        // Refund creator
        require(
            usdc.transfer(bounty.creator, bounty.reward),
            "Refund failed"
        );
        
        emit BountyCancelled(bountyId);
    }
    
    /**
     * @notice Update platform fee (owner only)
     */
    function setPlatformFee(uint256 newFee) external onlyOwner {
        require(newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = newFee;
    }
    
    /**
     * @notice Get bounty details
     */
    function getBounty(uint256 bountyId) external view returns (
        address creator,
        string memory taskDescription,
        uint256 reward,
        uint256 deadline,
        address claimant,
        bool completed,
        string memory submission
    ) {
        Bounty storage bounty = bounties[bountyId];
        return (
            bounty.creator,
            bounty.taskDescription,
            bounty.reward,
            bounty.deadline,
            bounty.claimant,
            bounty.completed,
            submissions[bountyId]
        );
    }
    
    /**
     * @notice Get active bounties count
     */
    function getActiveBounties() external view returns (uint256 count) {
        for (uint256 i = 0; i < bountyCount; i++) {
            if (!bounties[i].completed && !bounties[i].cancelled) {
                count++;
            }
        }
    }
}
