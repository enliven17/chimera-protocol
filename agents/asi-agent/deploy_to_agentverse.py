#!/usr/bin/env python3
"""
Deployment script for ChimeraProtocol ASI Agent to Agentverse
Handles registration, configuration, and deployment
"""

import os
import json
import requests
import asyncio
from typing import Dict, Any
import argparse

class AgentverseDeployer:
    """Handles deployment to Agentverse platform"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://agentverse.ai/api/v1"
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
    
    def load_agent_config(self) -> Dict[str, Any]:
        """Load agent configuration from JSON file"""
        
        with open("agentverse_config.json", "r") as f:
            config = json.load(f)
        
        return config
    
    def prepare_agent_code(self) -> str:
        """Prepare agent code for deployment"""
        
        with open("agentverse_agent.py", "r") as f:
            agent_code = f.read()
        
        return agent_code
    
    def prepare_metta_knowledge_base(self) -> str:
        """Prepare MeTTa knowledge base"""
        
        with open("metta_knowledge_base.metta", "r") as f:
            metta_kb = f.read()
        
        return metta_kb
    
    async def register_agent(self, config: Dict[str, Any]) -> Dict[str, Any]:
        """Register agent on Agentverse"""
        
        print("📝 Registering agent on Agentverse...")
        
        registration_data = {
            "name": config["name"],
            "description": config["description"],
            "version": config["version"],
            "author": config["author"],
            "license": config["license"],
            "tags": config["tags"],
            "capabilities": config["capabilities"],
            "protocols": config["protocols"],
            "category": config["agentverse"]["category"],
            "subcategory": config["agentverse"]["subcategory"],
            "public": config["agentverse"]["public"],
            "mailbox": config["agentverse"]["mailbox"]
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/agents/register",
                headers=self.headers,
                json=registration_data
            )
            
            if response.status_code == 201:
                result = response.json()
                print(f"✅ Agent registered successfully!")
                print(f"📍 Agent ID: {result.get('agent_id')}")
                print(f"🔗 Agent URL: {result.get('agent_url')}")
                return result
            else:
                print(f"❌ Registration failed: {response.status_code}")
                print(f"Error: {response.text}")
                return {}
                
        except Exception as e:
            print(f"❌ Registration error: {e}")
            return {}
    
    async def upload_agent_code(self, agent_id: str, code: str) -> bool:
        """Upload agent code to Agentverse"""
        
        print("📤 Uploading agent code...")
        
        upload_data = {
            "agent_id": agent_id,
            "code": code,
            "runtime": "python3.9",
            "requirements": self.get_requirements()
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/agents/{agent_id}/code",
                headers=self.headers,
                json=upload_data
            )
            
            if response.status_code == 200:
                print("✅ Agent code uploaded successfully!")
                return True
            else:
                print(f"❌ Code upload failed: {response.status_code}")
                print(f"Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Code upload error: {e}")
            return False
    
    async def upload_knowledge_base(self, agent_id: str, metta_kb: str) -> bool:
        """Upload MeTTa knowledge base"""
        
        print("🧠 Uploading MeTTa knowledge base...")
        
        kb_data = {
            "agent_id": agent_id,
            "knowledge_base": metta_kb,
            "format": "metta",
            "version": "1.0.0"
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/agents/{agent_id}/knowledge",
                headers=self.headers,
                json=kb_data
            )
            
            if response.status_code == 200:
                print("✅ Knowledge base uploaded successfully!")
                return True
            else:
                print(f"❌ Knowledge base upload failed: {response.status_code}")
                print(f"Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Knowledge base upload error: {e}")
            return False
    
    async def configure_environment(self, agent_id: str, config: Dict[str, Any]) -> bool:
        """Configure agent environment variables"""
        
        print("⚙️ Configuring environment variables...")
        
        env_vars = {
            "HEDERA_RPC_URL": os.getenv("HEDERA_RPC_URL", "https://testnet.hashio.io/api"),
            "CHIMERA_CONTRACT_ADDRESS": os.getenv("CHIMERA_CONTRACT_ADDRESS", "0x7a9D78D1E5fe688F80D4C2c06Ca4C0407A967644"),
            "AGENTVERSE_API_KEY": self.api_key
        }
        
        # Add optional environment variables
        optional_vars = ["OPENAI_API_KEY", "ENVIO_API_KEY"]
        for var in optional_vars:
            if os.getenv(var):
                env_vars[var] = os.getenv(var)
        
        env_data = {
            "agent_id": agent_id,
            "environment": env_vars
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/agents/{agent_id}/environment",
                headers=self.headers,
                json=env_data
            )
            
            if response.status_code == 200:
                print("✅ Environment configured successfully!")
                return True
            else:
                print(f"❌ Environment configuration failed: {response.status_code}")
                print(f"Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Environment configuration error: {e}")
            return False
    
    async def deploy_agent(self, agent_id: str) -> bool:
        """Deploy agent to Agentverse"""
        
        print("🚀 Deploying agent...")
        
        deploy_data = {
            "agent_id": agent_id,
            "deployment_config": {
                "auto_start": True,
                "restart_policy": "always",
                "resource_limits": {
                    "memory": "512MB",
                    "cpu": "0.5"
                }
            }
        }
        
        try:
            response = requests.post(
                f"{self.base_url}/agents/{agent_id}/deploy",
                headers=self.headers,
                json=deploy_data
            )
            
            if response.status_code == 200:
                result = response.json()
                print("✅ Agent deployed successfully!")
                print(f"🌐 Agent endpoint: {result.get('endpoint')}")
                print(f"📱 Chat interface: {result.get('chat_url')}")
                return True
            else:
                print(f"❌ Deployment failed: {response.status_code}")
                print(f"Error: {response.text}")
                return False
                
        except Exception as e:
            print(f"❌ Deployment error: {e}")
            return False
    
    def get_requirements(self) -> str:
        """Get requirements.txt content"""
        
        try:
            with open("requirements.txt", "r") as f:
                return f.read()
        except FileNotFoundError:
            return """
uagents>=0.12.0
uagents-ai-engine>=0.4.0
requests>=2.28.0
aiohttp>=3.8.0
python-dotenv>=0.19.0
"""
    
    async def check_agent_status(self, agent_id: str) -> Dict[str, Any]:
        """Check agent deployment status"""
        
        try:
            response = requests.get(
                f"{self.base_url}/agents/{agent_id}/status",
                headers=self.headers
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                return {"status": "unknown", "error": response.text}
                
        except Exception as e:
            return {"status": "error", "error": str(e)}
    
    async def full_deployment(self) -> bool:
        """Complete deployment process"""
        
        print("🚀 Starting full deployment to Agentverse...")
        print("=" * 50)
        
        # Load configuration
        config = self.load_agent_config()
        print(f"📋 Loaded configuration for: {config['name']}")
        
        # Register agent
        registration_result = await self.register_agent(config)
        if not registration_result:
            print("❌ Deployment failed at registration step")
            return False
        
        agent_id = registration_result.get("agent_id")
        if not agent_id:
            print("❌ No agent ID returned from registration")
            return False
        
        # Upload agent code
        agent_code = self.prepare_agent_code()
        if not await self.upload_agent_code(agent_id, agent_code):
            print("❌ Deployment failed at code upload step")
            return False
        
        # Upload knowledge base
        metta_kb = self.prepare_metta_knowledge_base()
        if not await self.upload_knowledge_base(agent_id, metta_kb):
            print("⚠️ Knowledge base upload failed, continuing...")
        
        # Configure environment
        if not await self.configure_environment(agent_id, config):
            print("❌ Deployment failed at environment configuration step")
            return False
        
        # Deploy agent
        if not await self.deploy_agent(agent_id):
            print("❌ Deployment failed at final deployment step")
            return False
        
        # Check status
        print("\n🔍 Checking deployment status...")
        status = await self.check_agent_status(agent_id)
        print(f"📊 Agent status: {status.get('status', 'unknown')}")
        
        print("\n" + "=" * 50)
        print("🎉 Deployment completed successfully!")
        print(f"📍 Agent ID: {agent_id}")
        print(f"🌐 Agentverse URL: https://agentverse.ai/agents/{agent_id}")
        print(f"💬 Chat with your agent: https://agentverse.ai/chat/{agent_id}")
        print("\n📚 Next steps:")
        print("1. Test your agent via the Agentverse chat interface")
        print("2. Register for ASI:One chat protocol")
        print("3. Share your agent with the community")
        print("4. Monitor performance and iterate")
        
        return True

async def main():
    """Main deployment function"""
    
    parser = argparse.ArgumentParser(description="Deploy ChimeraProtocol ASI Agent to Agentverse")
    parser.add_argument("--api-key", help="Agentverse API key", default=os.getenv("AGENTVERSE_API_KEY"))
    parser.add_argument("--check-only", action="store_true", help="Only check requirements")
    
    args = parser.parse_args()
    
    if args.check_only:
        print("🔍 Checking deployment requirements...")
        
        # Check required files
        required_files = [
            "agentverse_agent.py",
            "agentverse_config.json", 
            "metta_knowledge_base.metta",
            "requirements.txt"
        ]
        
        missing_files = []
        for file in required_files:
            if not os.path.exists(file):
                missing_files.append(file)
        
        if missing_files:
            print(f"❌ Missing required files: {', '.join(missing_files)}")
            return False
        else:
            print("✅ All required files present")
        
        # Check environment variables
        required_env = ["AGENTVERSE_API_KEY"]
        missing_env = []
        for env_var in required_env:
            if not os.getenv(env_var):
                missing_env.append(env_var)
        
        if missing_env:
            print(f"❌ Missing environment variables: {', '.join(missing_env)}")
            return False
        else:
            print("✅ All required environment variables set")
        
        print("🎉 Ready for deployment!")
        return True
    
    if not args.api_key:
        print("❌ Agentverse API key required. Set AGENTVERSE_API_KEY environment variable or use --api-key")
        return False
    
    # Create deployer and run deployment
    deployer = AgentverseDeployer(args.api_key)
    success = await deployer.full_deployment()
    
    return success

if __name__ == "__main__":
    try:
        result = asyncio.run(main())
        exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n👋 Deployment cancelled by user")
        exit(1)
    except Exception as e:
        print(f"\n❌ Deployment error: {e}")
        exit(1)